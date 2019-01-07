export default async (ctx, next) => {
  if (ctx.state.isSignedIn()) {
    await next();
    return;
  }
  ctx.flash.set('User is not authoriped');
  ctx.redirect('/');
};
