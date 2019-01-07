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

export default (router) => {
  router
    .get('tasks', '/tasks', checkAuth, async (ctx) => {
      const tasks = await Task.findAll({ include: ['Creator', 'AssignedTo', 'Status'] });
      container.logger(`TASKS: ${JSON.stringify(tasks, ' ', 2)}`);
      ctx.render('tasks', { tasks });
    })
    .get('newTask', '/tasks/new', checkAuth, async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      const users = await User.findAll();
      const task = Task.build();
      ctx.render('tasks/new', { f: buildFormObj(task), taskStatuses, users });
    })
    .post('tasks', '/tasks', async (ctx) => {
      const { request: { body: form } } = ctx;
      const { userId } = ctx.session;
      form.form.creator = userId;
      const tags = parseTags(form.form.tags);
      const task = await Task.create(form.form);
      // container.logger(`FORM: ${JSON.stringify(form, ' ', 2)}`);
      try {
        task.save();
        // container.logger(`TASK: ${JSON.stringify(task, ' ', 2)}`);
        const arrTags = await findOrCreateTags(tags);
        // container.logger(`ARRTAGS: ${JSON.stringify(arrTags, ' ', 2)}`);
        await task.setTags(arrTags);
        // container.logger(`TASKNEW: ${JSON.stringify(task, ' ', 2)}`);
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        container.logger(`ERR: ${JSON.stringify(e, ' ', 2)}`);
        const taskStatuses = await TaskStatus.findAll();
        const users = await User.findAll();
        ctx.render('tasks/new', { f: buildFormObj(task, e), taskStatuses, users });
      }
    });
};
