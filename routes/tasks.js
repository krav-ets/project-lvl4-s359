import _ from 'lodash';
import buildFormObj from '../lib/formObjectBuilder';
import { Task, User, TaskStatus, Tag } from '../models'; //eslint-disable-line
import container from '../container';
import checkAuth from '../lib/checkAuth';


const parseTags = str => str.toLowerCase()
  .split('#')
  .map(s => s.replace(/\s+/g, ''))
  .filter(v => v !== '')
  .map(s => `#${s}`);

const findOrCreateTags = async (tags) => {
  const findOrCreate = t => Tag.findOrCreate({ where: { name: t } });
  const result = await Promise.all(tags.map(findOrCreate));
  return result.map(a => a[0]);
};

const filterQuery = form => Object.keys(form)
  .filter(key => form[key] !== '')
  .reduce((acc, key) => ({ ...acc, [key]: form[key] }), {});

const setDefaultStatus = (taskName, statuses) => statuses.filter(s => s.name === taskName);

const convertTagsToString = tags => tags
  .map(tag => tag.name)
  .join(' ');

const scopes = [
  {
    check: (key, value) => key === 'creator' && value === 'my',
    func: (key, value, ctx) => ({ method: [key, ctx.session.userId] }),
  },
  {
    check: (key, value) => value !== 'my',
    func: (key, value) => ({ method: [key, value] }),
  },
];

const buildQuery = (ctx) => {
  const queryParams = filterQuery(ctx.request.query);
  const getScopes = (key, value) => _.find(scopes, ({ check }) => check(key, value));

  return Object.keys(queryParams).map((key) => {
    const { func } = getScopes(key, queryParams[key]);
    return func(key, queryParams[key], ctx);
  });
};

export default (router) => {
  router
    .get('tasks', '/tasks', checkAuth, async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      const users = await User.findAll();
      container.logger(`CTX_query ${JSON.stringify(ctx.request.query, ' ', 2)}`);
      if (Object.keys(ctx.request.query).length) {
        const query = buildQuery(ctx);
        const tasks = await Task.scope(...query).findAll({ include: ['Creator', 'AssignedTo', 'Status'] });
        ctx.render('tasks', { tasks, users, taskStatuses });
        return;
      }
      const tasks = await Task.findAll({ include: ['Creator', 'AssignedTo', 'Status'] });
      ctx.render('tasks', { tasks, users, taskStatuses });
    })
    .get('newTask', '/tasks/new', checkAuth, async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      const defaultStatus = setDefaultStatus('new', taskStatuses);
      const users = await User.findAll();
      const task = Task.build();
      ctx.render('tasks/new', { f: buildFormObj(task), defaultStatus, users });
    })
    .get('editTask', '/tasks/:id/edit', checkAuth, async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      const users = await User.findAll();
      const task = await Task.findByPk(ctx.params.id);
      const tags = await task.getTags();
      task.tags = convertTagsToString(tags);
      ctx.render('tasks/edit', { f: buildFormObj(task), taskStatuses, users });
    })
    .patch('editTask', '/tasks/:id/edit', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      const tags = parseTags(form.form.tags);
      const task = await Task.findByPk(ctx.params.id);
      try {
        await task.update(form.form);
        const arrTags = await findOrCreateTags(tags);
        await task.setTags(arrTags);
        ctx.flash.set('Task has been edited');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.render('tasks/edit', { f: buildFormObj(task, e) });
      }
    })
    .post('tasks', '/tasks', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      const { userId } = ctx.session;
      form.form.creator = userId;
      const tags = parseTags(form.form.tags);
      const task = await Task.build(form.form);
      try {
        await task.save();
        const arrTags = await findOrCreateTags(tags);
        await task.setTags(arrTags);
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        const taskStatuses = await TaskStatus.findAll();
        const users = await User.findAll();
        ctx.render('tasks/new', { f: buildFormObj(task, e), taskStatuses, users });
      }
    })
    .delete('editTask', '/tasks/:id/edit', checkAuth, async (ctx) => {
      const task = await Task.findByPk(ctx.params.id);
      try {
        await task.destroy();
        ctx.flash.set('Task has been deleted');
        ctx.redirect(router.url('tasks'));
      } catch {
        ctx.flash.set('Deletion failed');
        ctx.redirect(router.url('tasks'));
      }
    });
};
