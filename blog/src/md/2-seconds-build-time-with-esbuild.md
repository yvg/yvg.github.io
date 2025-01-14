---
title: "2 seconds build time with ESbuild"
date: 2022-01-17
---

Jan. 17, 2022

# 2 seconds build time with ESbuild (bye Webpack)

<p class="info">
  This article was orginally published at <a href="https://tooltime.tech/2-seconds-build-time-with-esbuild/">tooltime.tech</a>, it has been copied for archiving purposes.
</p>

## Foreword

Like so many applications out there, our WebApp MVP was initially generated with the popular create-react-app command-line tool. It makes things very easy at first: no need to think about how to set up a local server, a bundler, a compiler, typescript config, how to support multiple content types,… and their documentation describes it very nicely:

> You **don’t** need to install or configure tools like webpack or Babel. They are preconfigured and hidden so that you can focus on the code.

With time, however, applications increase in complexity, consumers require more features, and developers raise different needs. What was initially a great "all-in-one" solution to us, now feels like a black box of technologies smashed together… and nobody really knows how and what it does.

All we know is that it affects us. On an everyday basis, it impacts how multiple teams work, how quick we can ship changes to our customers, and ultimately how developers feel.

So, let's look at Webpack and what problems we faced.

## Issues we faced with Webpack

A bit of context first: Our TypeScript codebase contains around 150 000 lines of code, we don't have a fancy code-splitting strategy, nor caching strategy, nor do we do any heavy transformations in the build or on the local dev server.
<br>

### Dev server

The first problem we faced daily was the startup time of the webpack/babel/typescript black box on our computers.

> 3 minutes

That's the time it takes on my Intel MacBook Pro from 2020 to run `yarn start`.

While slow, it's not a command we would run many times per day, so the feeling of frustration was limited to the morning. And these 3 minutes would usually allow me to get a cup of coffee. However, when things needed to go quick… we were forced to wait.

### Production build

This was the real pain point. Building our App with Webpack took:

> 45 minutes

Yes, **45 frigging minutes.**

In practice, this meant that, for example, bug fixes required an extra 45 minutes from merged (and solved locally) to being solved in production.

This was a very frustrating situation for our engineering team, so we had a good reason to experiment with alternatives.

We had a look at solutions such as Vite, Snowpack, and others,… but [esbuild](https://esbuild.github.io/) blew us away from the very first try.

## ESbuild

The main problem we tried to solve was the build time, therefore, we tried it out locally with the **ESbuild CLI.** What we witnessed was beyond our wildest dreams.

Here is what I typed in my terminal:

```sh
npx esbuild src/app/App.tsx --loader:.svg=file --loader:.png=file --bundle --outfile=build2/out.js
```

And here is the output:

```sh
  build2/out.js                      18.6mb ⚠️
  build2/intros-RE7GI7PZ.svg         56.9kb
  build2/footer-XMLWO6FL.svg         39.6kb
  build2/question-HHFNHGW3.svg        773b
  ...and 56 more output files...

⚡ Done in 1336ms
```

At this moment, my colleague (👋 hello Hamed) and I looked at each other very confused, we both assumed the same: ESbuild did absolutely nothing, what could it possibly have built in **1336ms?**

Turns out, it built absolutely everything, I ran a `cat build2/out.js` and our confusion turned into disbelief. Everything was there. Not only the code but also the SVG & PNG assets were present in the `build2` folder.

We then ran a few more tries in the CLI to experiment with the ESbuild features, and then eventually decided to write a Node script with their [Build API](https://esbuild.github.io/api/#build). Eight hours later we had a staging environment running ESbuild with at its core this simple code:

```js
esbuild
  .build({
    logLevel: "info",
    publicPath: "/",
    entryPoints: ["src/index.tsx"],
    bundle: true,
    minify: true,
    outfile: "build/out.js",
    define: { global: "window" },
    sourcemap: true,
    loader: {
      ".png": "file",
      ".svg": "file",
    },
    target: ["firefox90", "chrome90", "safari13"],
  })
  .catch(() => process.exit(1));
```

### Any drawbacks?

One took us a few hours to figure out. **Dynamic exports are not supported.**

This is not really a concern to us, but some of our third-party dependencies are relying on dynamic imports internally. So we started encountering bizarre issues with libraries such as MaterialUI and Amplify.

The solution to this is very simple: use `require` to import their modules, instead of relying on `import`.

### Local server

In addition to the Build API, ESbuild also features a Serve API, adapting the build script to run a local server was very easy as it is (nearly) the same API.

## Conclusion

The build time and the local server boot time now both take **~2 seconds.** Without a doubt the fastest setup I have ever witnessed to run and to build a WebApp.

We dramatically improved our developer experience, release our changes faster to our customers, and eliminated frustration from our daily work.

If you have read this far, I urge you to give **ESbuild** a try. Getting started is as simple as running the command above (or similar).

🖖

## Additional resources

While researching this topic we came across a few things we did not end up using, but found interesting nevertheless:

- Netlify [forked ESbuild](https://github.com/netlify/esbuild) to fix the dynamic import problem.
- There is a [create-react-app plugin](https://github.com/pradel/create-react-app-esbuild) if you haven't/can't eject your configuration.
