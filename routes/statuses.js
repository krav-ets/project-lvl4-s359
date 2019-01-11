import buildFormObj from '../lib/formObjectBuilder';
import { TaskStatus } from '../models'; //eslint-disable-line
import container from '../container';
import checkAuth from '../lib/checkAuth';

export default (router) => {
  router
    .get('statuses', '/statuses', checkAuth, async (ctx) => {
      const statuses = await TaskStatus.findAll();
      const status = TaskStatus.build();
      container.logger(`STATUSES: ${JSON.stringify(statuses, ' ', 2)}`);
      ctx.render('statuses', { f: buildFormObj(status), statuses });
    })
    .get('editStatus', '/statuses/:id/edit', checkAuth, async (ctx) => {
      const status = await TaskStatus.findByPk(ctx.params.id);
      container.logger(`STATUS: ${JSON.stringify(status, ' ', 2)}`);
      ctx.render('statuses/edit', { f: buildFormObj(status) });
    })
    .patch('editStatus', '/statuses/:id/edit', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      container.logger(`EditStatFORM: ${JSON.stringify(form, ' ', 2)}`);
      const status = await TaskStatus.findByPk(ctx.params.id);
      try {
        await status.update(form.form);
        ctx.flash.set('Status has been edited');
        ctx.redirect(router.url('statuses'));
      } catch (e) {
        const statuses = await TaskStatus.findAll();
        ctx.render('statuses', { f: buildFormObj(status, e), statuses });
      }
    })
    .post('addStatus', '/statuses', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      const status = await TaskStatus.build(form.form);
      container.logger(`AddStatForm: ${JSON.stringify(form, ' ', 2)}`);
      try {
        await status.save();
        container.logger(`StatADD: ${JSON.stringify(status, ' ', 2)}`);
        ctx.flash.set('Status has been created');
        ctx.redirect(router.url('statuses'));
      } catch (e) {
        container.logger(`ErrADD: ${JSON.stringify(e, ' ', 2)}`);
        const statuses = await TaskStatus.findAll();
        ctx.render('statuses', { f: buildFormObj(status, e), statuses });
      }
    })
    .delete('editStatus', '/statuses/:id/edit', checkAuth, async (ctx) => {
      const status = await TaskStatus.findByPk(ctx.params.id);
      try {
        await status.destroy();
        ctx.flash.set('Status has been deleted');
        ctx.redirect(router.url('statuses'));
      } catch {
        ctx.flash.set('Deletion failed');
        ctx.redirect(router.url('statuses'));
      }
    });
};
