
export async function stock (ctx, next) {
  const { code } = ctx.request.body
  console.log(code)
  await next()
}