if (!self.define) {
  let e,
    c = {};
  const s = (s, a) => (
    (s = new URL(s + ".js", a).href),
    c[s] ||
      new Promise((c) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = s), (e.onload = c), document.head.appendChild(e));
        } else ((e = s), importScripts(s), c());
      }).then(() => {
        let e = c[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, i) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (c[n]) return;
    let r = {};
    const o = (e) => s(e, n),
      d = { module: { uri: n }, exports: r, require: o };
    c[n] = Promise.all(a.map((e) => d[e] || o(e))).then((e) => (i(...e), r));
  };
}
define(["./workbox-4754cb34"], function (e) {
  "use strict";
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "60fb69de5996eb4ff939b83c994c58bf",
        },
        {
          url: "/_next/dynamic-css-manifest.json",
          revision: "d751713988987e9331980363e24189ce",
        },
        {
          url: "/_next/static/DrqyEXGFQbOIBx7gphhxb/_buildManifest.js",
          revision: "56313a2fa41efe17a9286c47ac6aacba",
        },
        {
          url: "/_next/static/DrqyEXGFQbOIBx7gphhxb/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/401-9c83f19ef159e000.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/461-45656ccefe6feb66.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/4bd1b696-91e03536f617824e.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/684-92dbe396d47f1367.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/818-6d9afa844249537e.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/95247769-6721ce03eb01996f.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-3cd527d88fe4d9af.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/app/layout-f87d334fd6a31868.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/app/page-c11fa48f65b1671d.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/framework-f593a28cde54158e.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/main-6b22041cb95dac0b.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/main-app-ea818931c4b8ebf8.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/pages/_app-da15c11dea942c36.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/pages/_error-cc3f077a18ea1793.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-2e49cb9ded9d70e7.js",
          revision: "DrqyEXGFQbOIBx7gphhxb",
        },
        {
          url: "/_next/static/css/acf6046fc25eb8d1.css",
          revision: "acf6046fc25eb8d1",
        },
        {
          url: "/_next/static/css/c641c4aba1c789a1.css",
          revision: "c641c4aba1c789a1",
        },
        {
          url: "/_next/static/media/569ce4b8f30dc480-s.p.woff2",
          revision: "ef6cefb32024deac234e82f932a95cbd",
        },
        {
          url: "/_next/static/media/747892c23ea88013-s.woff2",
          revision: "a0761690ccf4441ace5cec893b82d4ab",
        },
        {
          url: "/_next/static/media/8d697b304b401681-s.woff2",
          revision: "cc728f6c0adb04da0dfcb0fc436a8ae5",
        },
        {
          url: "/_next/static/media/93f479601ee12b01-s.p.woff2",
          revision: "da83d5f06d825c5ae65b7cca706cb312",
        },
        {
          url: "/_next/static/media/9610d9e46709d722-s.woff2",
          revision: "7b7c0ef93df188a852344fc272fc096b",
        },
        {
          url: "/_next/static/media/ba015fad6dcf6784-s.woff2",
          revision: "8ea4f719af3312a055caf09f34c89a77",
        },
        {
          url: "/decks/aws-cloud-practitioner/AWS-Cloud-Practitioner.md",
          revision: "0deb568a4fc25f7579bcd893150b2ff1",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-1.json",
          revision: "b85e17af0d84c233f61eb9e8e580d956",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-10.json",
          revision: "8061b2e2e9a1f5ad9c59fede166c4f12",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-11.json",
          revision: "1007ec85b9f76df1b5d66283c397fcf9",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-12.json",
          revision: "0a672e0a6413ae0fcf577b36b118eadc",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-13.json",
          revision: "563b9302dca09d6859a27ac06f3afdc9",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-14.json",
          revision: "7f68b379c3a4d457071d9675d93d8283",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-15.json",
          revision: "f2c93d7004873736e31562eb535091ca",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-2.json",
          revision: "c50c3fe48c0638206fc9c740909b22f0",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-3.json",
          revision: "453c8d0388ef35d75dbc9466a39f5d8b",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-4.json",
          revision: "9c1a76fe9e7cfb2bfec94db155c43190",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-5.json",
          revision: "1d57e8ee192808807f29ff8f951cb9ee",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-6.json",
          revision: "890391491b7589061de5338c3a03cbdc",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-7.json",
          revision: "b6a11261bf975f8a8b5701c65b3ecac5",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-8.json",
          revision: "7fa8142c4cb7892e6ab3731d478a5010",
        },
        {
          url: "/decks/aws-cloud-practitioner/chapter-9.json",
          revision: "92c0dad0f6e3223ee77014dffe9f6bc1",
        },
        {
          url: "/decks/aws-cloud-practitioner/utils.py",
          revision: "9d5c94c1e045ebae1c477f67ffb749c5",
        },
        {
          url: "/decks/course-2/module-1-1.json",
          revision: "582ab74c79e301ba7cfb31e022623cd7",
        },
        {
          url: "/decks/course-2/module-1-2.json",
          revision: "f8b92dad887540393469cf53b0b6a82b",
        },
        {
          url: "/decks/course-2/module-1-3.json",
          revision: "08ebfcc7353fe4d018c1fe42823e2157",
        },
        {
          url: "/decks/course-2/module-1-4.json",
          revision: "6cd0c3a20d396a3609d7108a2106ab68",
        },
        {
          url: "/decks/course-2/module-1-5.json",
          revision: "5f96c5fcedd4336408a936becf9a5e37",
        },
        {
          url: "/decks/course-2/module-1-6.json",
          revision: "2f443f235ac325d951adddbfe1508aec",
        },
        {
          url: "/decks/course-2/module-2-1.json",
          revision: "ccffc2da86b096b8d731a2069d34185b",
        },
        {
          url: "/decks/course-2/module-2-2.json",
          revision: "8bd5c510c53b4c49a5208ba98cdbea9f",
        },
        {
          url: "/decks/course-2/module-2-3.json",
          revision: "4152d24446fae7b7aadad64dc849e574",
        },
        {
          url: "/decks/course-2/module-2-5.json",
          revision: "3c7b80c554b3d20af7cca4745cb909a6",
        },
        {
          url: "/decks/course-2/module-3-1.json",
          revision: "7e9d3910310fdce2d5ad14ed0ce3778b",
        },
        {
          url: "/decks/course-2/module-3-2.json",
          revision: "284bc8392a0b8d56057b922f8916eab2",
        },
        {
          url: "/decks/course-2/module-3-3.json",
          revision: "902c966466e82424c0536cbd0c85cc50",
        },
        {
          url: "/decks/course-2/module-3-4.json",
          revision: "25194f1cfbd45d3ac37d25b530c25b11",
        },
        {
          url: "/decks/course-2/module-3-5.json",
          revision: "230824b539a466ea38a33d4f1a2bf0cd",
        },
        {
          url: "/decks/course-2/module-3-6.json",
          revision: "7052cbf6de85a4e630baaaf4d272f7e6",
        },
        {
          url: "/decks/course-2/module-3-7.json",
          revision: "0ba81069de7a032f2f9c5ec6a3978aee",
        },
        {
          url: "/decks/course-2/module-4-1.json",
          revision: "f6369cd959c1235c416feb2ab82d5304",
        },
        {
          url: "/decks/course-2/module-4-2.json",
          revision: "c235aff543e99acacd7dc468f5e93851",
        },
        {
          url: "/decks/course-2/module-4-3.json",
          revision: "c235aff543e99acacd7dc468f5e93851",
        },
        {
          url: "/decks/course-2/module-4-4.json",
          revision: "622267e18d224afe46eb9fb6f77b87d2",
        },
        {
          url: "/decks/course-3/module-1-1.json",
          revision: "bbfd887a9893073e12b9602ac1da786b",
        },
        {
          url: "/decks/course-3/module-3-1.json",
          revision: "a180287244a5a6f2e78dd08aab949aa0",
        },
        {
          url: "/decks/course-3/module-3-2.json",
          revision: "62ad092300059b4285a757e66daf422b",
        },
        {
          url: "/decks/course-3/module-4-1.json",
          revision: "13dd0c45e3b6a59407b318ea269a8157",
        },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        { url: "/icons/100.png", revision: "dfbd3a7aa06c9ebbe4380f1d0389e065" },
        {
          url: "/icons/1024.png",
          revision: "f3f6674da83cb0ea7cca2ff24823cbb1",
        },
        { url: "/icons/114.png", revision: "5378dd1cbb7d258a8ef911d7b65a6799" },
        { url: "/icons/120.png", revision: "94b44bb5a6b98320c7698893109f5dde" },
        { url: "/icons/128.png", revision: "0be206ed71aac2248a2ea5b9afe87f8f" },
        { url: "/icons/144.png", revision: "ce40ba30076d843a7257c3da2a26c968" },
        { url: "/icons/152.png", revision: "0f0caf03be687587e8175a8217dfedfb" },
        { url: "/icons/16.png", revision: "c340f098434d4a2102499d3c19b008a1" },
        { url: "/icons/167.png", revision: "fe3161fe48c5baee96ab9ff40fe6fbc2" },
        { url: "/icons/180.png", revision: "fddd4927323ad9bb108c333252d75979" },
        { url: "/icons/192.png", revision: "68409fb8e82694287bbcf8bd489ce253" },
        { url: "/icons/20.png", revision: "ae6e2c66596448e7219c7a0535d30633" },
        { url: "/icons/256.png", revision: "8ea77acd82572a62e3961389a7eac2da" },
        { url: "/icons/29.png", revision: "4d112e83eb358dade6c51b5228a9c110" },
        { url: "/icons/32.png", revision: "b2d4e068c3925fb8a5a69bbd386d4075" },
        { url: "/icons/40.png", revision: "36134a48ac888a1d56f626d7b270fb67" },
        { url: "/icons/50.png", revision: "bbbcdcb025bda429bfffeb23ce6895ad" },
        { url: "/icons/512.png", revision: "373bcfb5eb57620cf9965f66d6f37aca" },
        { url: "/icons/57.png", revision: "d253c5589eec027a257dc877dea51ec6" },
        { url: "/icons/58.png", revision: "3772b713489ef8fee70875f97846a352" },
        { url: "/icons/60.png", revision: "1f6f3d3960d3fbe2eee525753846da58" },
        { url: "/icons/64.png", revision: "e6420c435e6ac58343c7482e08081991" },
        { url: "/icons/72.png", revision: "c25db0987e7fff7ec087607211ba5708" },
        { url: "/icons/76.png", revision: "45b2616ed9420ed5d12c86f72b32707f" },
        { url: "/icons/80.png", revision: "1c5640d308935ee338120c1aa99eb551" },
        { url: "/icons/87.png", revision: "7702c65cb65c345a1e3b5468369b09d9" },
        {
          url: "/icons/AppImages.zip",
          revision: "b67fb753bd80fda712a942929ec520eb",
        },
        {
          url: "/icons/channels4_profile.jpg",
          revision: "37270b7bc5c0f4d87475ce7d7e94d10e",
        },
        { url: "/manifest.json", revision: "308ac1a1a73502f278f35aaf7a38f0a4" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: c,
              event: s,
              state: a,
            }) =>
              c && "opaqueredirect" === c.type
                ? new Response(c.body, {
                    status: 200,
                    statusText: "OK",
                    headers: c.headers,
                  })
                : c,
          },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const c = e.pathname;
        return !c.startsWith("/api/auth/") && !!c.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET",
    ));
});
