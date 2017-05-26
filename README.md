# purescript-npm

Traditionally, the PureScript ecosystem has used the [Bower](https://bower.io/) package manager to manage packages. Harry Garrood explained the reasons why in a great [blog post](http://harry.garrood.me/blog/purescript-why-bower/). This tool came from the JavaScript community as an alternative to [npm](https://www.npmjs.com/), which was typically used only for backend Node packages at the time and used nested dependencies, which psc can't handle.

In the broader JavaScript community, however, Bower has fallen out of favor. The community has begun to coalesce on npm, with tools like [Yarn](https://yarnpkg.com/en/) and [Lerna](https://lernajs.io/) springing up to help manage larger or more complex packaging workflows. The `--flat` option for Yarn avoids the PureScript community's issue with nested dependencies by preventing them altogether.

This project is an attempt to pull the PureScript ecosystem effectively into npm, publishing mirrors of common PureScript packages through the [@purescript](https://www.npmjs.com/org/purescript) organization on npm. If you'd like to help maintain packages, let [@bkonkle](https://github.com/bkonkle) know!

## Usage

To use these packages, you'll need to include `node_modules` in your build sources. Examples are below.

### purs-loader

Add `'node_modules/@purescript/*/src/**/*.purs'` and `'node_modules/purescript-*/src/**/*.purs'`to the `src` loader option:

```js
{
  test: /\.purs$/,
  loader: 'purs-loader',
  query: {
    psc: 'psa',
    src: [
      'node_modules/@purescript/*/src/**/*.purs',
      'node_modules/purescript-*/src/**/*.purs',
      'src/**/*.purs'
    ]
  }
}
```

### psc

Include the `node_modules` dependencies on your `psc` command line.

```sh
$ psc src/Main.purs 'node_modules/@purescript/*/src/**/*.purs' 'node_modules/purescript-*/src/**/*.purs'
```

## Available Packages

[The full list of available packages!](https://www.npmjs.com/org/purescript)

## Development

Adding a package:

```sh
$ git submodule add https://github.com/$GHUSER/purescript-$PROJECT.git packages/$PROJECT
$ scripts/refresh.js $PROJECT
```

Currently, this throws an error. It's expected, and I'll smooth that out later. To resolve, just publish the new package.

```sh
$ cd packages/$PROJECT
$ npm publish --access public
```
