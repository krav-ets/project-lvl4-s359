import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import { User } from '../models'; //eslint-disable-line
// import container from '../container';

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      const error = { errors: [] };
      if (!user) {
        error.errors.push({ path: 'email', message: 'The user is not found' });
      }
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.flash.set('You are authorized');
        ctx.redirect(router.url('root'));
        return;
      }
      error.errors.push({ path: 'password', message: 'Incorrect password' });
      ctx.render('sessions/new', { f: buildFormObj({ email }, error) });
    })
    .delete('session', '/session', async (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
