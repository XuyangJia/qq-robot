export async function auth (ctx, next) {
  const { authorization = '' } = ctx.request.header
  console.log(authorization)
  await next()
}