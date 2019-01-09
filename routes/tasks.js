import buildFormObj from '../lib/formObjectBuilder';
import { Task, User, TaskStatus, Tag } from '../models'; //eslint-disable-line
// import container from '../container';
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

const setDefaultStatus = (taskName, statuses) => statuses.filter(s => s.name === taskName);

const convertTagsToString = tags => tags
  .map(tag => tag.name)
  .join(' ');

export default (router) => {
  router
    .get('tasks', '/tasks', checkAuth, async (ctx) => {
      const tasks = await Task.findAll({ include: ['Creator', 'AssignedTo', 'Status'] });
      ctx.render('tasks', { tasks });
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
        task.save();
        const arrTags = await findOrCreateTags(tags);
        await task.setTags(arrTags);
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('root'));
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
