export async function json(url: string): Promise<any> {
  return await (await fetch(url)).json()
}

export async function binary(url: string): Promise<Buffer> {
  return Buffer.from(await (await fetch(url)).arrayBuffer())
}
