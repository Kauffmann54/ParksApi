export default {
  async fetch(request) {
    const url = new URL(request.url);
    const parkId = url.searchParams.get("parkId");
    if (!parkId || !/^[0-9a-f-]{36}$/i.test(parkId)) return new Response("parkId inválido", {status:400});
    const upstream = await fetch(`https://api.themeparks.wiki/v1/entity/${parkId}/live`, {headers:{Accept:"application/json"}});
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=300"
      }
    });
  }
}