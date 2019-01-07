import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import { User } from '../models'; //eslint-disable-line
import container from '../container';
import checkAuth from '../lib/checkAuth';

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
    })
    .get('newUser', '/users/new', (ctx) => {
      const user = User.build();
      // container.logger(`USER: ${JSON.stringify(user)}`);
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('users', '/users', async (ctx) => {
      const { request: { body: form } } = ctx;
      const user = User.build(form.form);
      // container.logger(`FORM: ${JSON.stringify(form)}`);
      // container.logger(`USER: ${JSON.stringify(user)}`);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        // container.logger(`ERR: ${JSON.stringify(e, ' ', 2)}`);
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('profile', '/users/profile', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      container.logger(`USER_PROFILE_OBJ: ${JSON.stringify({ f: buildFormObj(user) }, ' ', 2)}`);
      ctx.render('users/profile', { f: buildFormObj(user) });
    })
    .patch('profile', '/users/profile', async (ctx) => {
      const { userId } = ctx.session;
      const { request: { body: form } } = ctx;
      const user = await User.findByPk(userId);
      container.logger(`BODY: ${JSON.stringify(ctx.request.body, ' ', 2)}`);
      try {
        await user.update(form.form);
        ctx.flash.set('Profile has been edited');
        ctx.redirect(router.url('profile'));
      } catch (e) {
        ctx.render('users/profile', { f: buildFormObj(user, e) });
      }
    })
    .get('changePassword', '/users/profile/change_password', checkAuth, async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      ctx.render('users/change_password', { f: buildFormObj(user) });
    })
    .patch('changePassword', '/users/profile/change_password', async (ctx) => {
      const { userId } = ctx.session;
      const { password, newPassword, confirmPassword } = ctx.request.body.form;
      const user = await User.findByPk(userId);
      const error = { errors: [] };
      if (newPassword !== confirmPassword) {
        error.errors.push({ path: 'confirmPassword', message: 'Passwords do not match' });
        ctx.render('users/change_password', { f: buildFormObj({}, error) });
        return;
      }
      if (user && user.passwordDigest === encrypt(password)) {
        try {
          await user.update({ password: newPassword });
          ctx.flash.set('Password has been changed');
          ctx.redirect(router.url('root'));
          return;
        } catch (e) {
          ctx.render('users/change_password', { f: buildFormObj(user, e) });
        }
      } else {
        error.errors.push({ path: 'password', message: 'Incorrect password' });
      }
      ctx.render('users/change_password', { f: buildFormObj({}, error) });
    })
    .delete('deleteUser', '/users', async (ctx) => {
      const { userId } = ctx.session;
      const user = await User.findByPk(userId);
      // container.logger(`USER_DEL: ${JSON.stringify(user, ' ', 2)}`);
      try {
        await user.destroy();
        ctx.flash.set('User was deleted');
        ctx.session = {};
        ctx.redirect(router.url('users'));
      } catch (e) {
        // container.logger(`ERR: ${JSON.stringify(e, ' ', 2)}`);
        ctx.flash.set('The user is not deleted');
        ctx.redirect(router.url('profile'));
      }
    });
};
