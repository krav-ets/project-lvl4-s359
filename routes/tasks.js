import buildFormObj from '../lib/formObjectBuilder';
import { Task, User, TaskStatus } from '../models'; //eslint-disable-line
import container from '../container';

export default (router) => {
  router
    .get('newTask', '/tasks/new', async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      const users = await User.findAll();
      const task = Task.build();
      container.logger(`GETFORM: ${JSON.stringify({ f: buildFormObj(task), taskStatuses, users }, ' ', 2)}`);
      ctx.render('tasks/new', { f: buildFormObj(task), taskStatuses, users });
    })
    .post('tasks', '/tasks', async (ctx) => {
      const { request: { body: form } } = ctx;
      // const { userId } = ctx.session;

      // const user = Task.build(form.form);
      container.logger(`FORM: ${JSON.stringify(form, ' ', 2)}`);
      container.logger(`Session: ${JSON.stringify(ctx.session, ' ', 2)}`);
      /*
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        // container.logger(`ERR: ${JSON.stringify(e, ' ', 2)}`);
        ctx.render('users/new', { f: buildFormObj(user, e) });
         }
      */
      ctx.flash.set('Task has been created');
      ctx.redirect(router.url('root'));
    });
};
