// 朝刊：毎朝7時の通知を受け取って表示する（Mac Studio の scripts/webpush.mjs が送る）
self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("push", function(e){
  e.waitUntil((async function(){
    var d = null;
    try { d = e.data ? e.data.json() : null; } catch (x) { try { d = {body: e.data.text()}; } catch (y) {} }
    if (!d || !d.body) {
      try { var t = await (await fetch("/notify.txt?t=" + Date.now(), {cache: "no-store"})).text(); d = {body: t.trim().replace(/。?https?:\/\/\S+$/, "")}; }
      catch (z) { d = {body: "今朝の朝刊が届きました。"}; }
    }
    await self.registration.showNotification(d.title || "朝刊", {body: d.body, icon: "/icon-180.png", badge: "/icon-180.png", tag: "chokan-morning", data: {url: d.url || "/"}});
  })());
});
self.addEventListener("notificationclick", function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(self.clients.matchAll({type: "window", includeUncontrolled: true}).then(function(list){
    for (var i = 0; i < list.length; i++) { if ("focus" in list[i]) return list[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
