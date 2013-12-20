deft
====

A dependency declaration system for JavaScript app developers.

*Wait, stop walking away!* I swear, there are reasons. Read on, then make your judgment.

## Why not Bower, component, volo, ...?

Good question. I too am pretty overwhelmed by the abundance of dependency management systems out there right now. If you haven't heard of these, they're all great in their own way and definitely worth checking out:

- [Bower](http://bower.io/)
- [component](http://component.io/)
- [volo](http://volojs.org/)

Now, there is an issue with all of these options, which is why I created deft. **They require library maintainers to do the integration.** So with Bower, for example, if you want to support it you need to add a **bower.json** file to your repo. Similarly, component requires a **component.json** file and volo requires that you update your **package.json** file with a `"volo"` property.

This isn't necessarily a bad thing. It gives library developers control over how their code is consumed by others.

Here's the situation I've run into, though: I'm developing an *application*, and I want to depend on libraries X, Y, and Z. Maybe X supports Bower, Y supports component, and Z supports volo. I could:

1. Petition the maintainers of these libraries to add support for my system of choice
2. Fork two of the three libraries and add support myself, then depend on my fork
3. Just pull the libraries directly into my application

I don't like the first option because it just feels like an uphill battle, expecting everyone to adopt Bower or component or volo.

I don't like the second option because it either positions *me* as the false maintainer of a project (e.g., in Bower anyone can register any library) or forces me to use some weird fork-y name (like "dtao-libraryX" instead of "libraryX"). Worse, I see that approach leading to fork proliferation in the long term. And we should all behave in such a way that society is better off... yada yada yada.

As for the third option, there are obvious issues with it. For one, pulling the source code for other libraries into my code base bloats my repository. I could add them to my **.gitignore** file, but then I'm forced to manually re-download them whenever I clone the repo to a new location.

## How deft is different

So here's the idea with deft. Unlike the alternatives, it doesn't require library maintainers to do anything. You can start using it and declaring your library dependencies right away, using only GitHub (or the web) as your registry.

First, install deft:

    npm install -g deft

Next, create a file called **deft.json** in repository of your application. Declare your dependencies in that file (see below), then run:

    deft

And that's it. Deft will grab your dependencies and put them where you want them.

### Declaring dependencies

Here's an example **deft.json** file:

```json
{
  "destination": "lib",
  "dependencies": [
    ["lodash/lodash", "2.3.0", "lodash.js"]
  ]
}
```

This file declares one dependency: [Lo-Dash](https://github.com/lodash/lodash). It instructs deft to fetch from **version 2.3.0** (must be a valid git tag) the file **lodash.js**---which is specified as a path relative to the root of the repository---and save it to the "lib" directory. (If you don't specify the "destination" property, deft will create a "deft" directory and save everything there.)

Every dependency is declared as an array. (I know it's weird, but it's *concise*! Also, I think it's pretty readable.) The first element identifies a *location*---in this example, a GitHub repository---and the last element identifies the file(s) to download. The middle tag element is optional; if absent, deft will default to fetching from the master branch (for git repos).

Now suppose you want to download multiple files from the same project. You can also specify an array of files:

```json
["dtao/lazy.js", "0.2.1", ["lazy.js", "lazy.dom.js"]]
```

You may also want to put files within subfolders that differ in structure from the source repo's. Here's an example:

```json
["marijnh/CodeMirror", "v3.12", {
  "lib/codemirror.css": "codemirror.css",
  "lib/codemirror.js": "codemirror.js",
  "mode/javascript/javascript.js": "codemirror/javascript.js"
}]
```

You can also depend on files located at arbitrary URLs. Here's an example:

```json
["http://code.jquery.com", { "jquery-1.10.1.js": "jquery.js" }]
```

The above dependency instructs deft to download the file at **http://code.jquery.com/jquery-1.10.1.js** and save it to **jquery.js**.

Suppose the sweet source code you seek is locked away in an archive. No problem! Tell deft to extract the contents you want like so:

```json
["http://code.angularjs.org/1.2.5/angular-1.2.5.zip", {
  "archive": {
    "type": "zip",
    "files": [
      "angular-1.2.5/angular.js",
      "angular-1.2.5/angular.min.js"
    ]
  }
}]
```

By default, deft will not download files that are already present. You can force it to (e.g., if you've updated the versions you're depending on) using the `--force` option:

    deft --force

Also, you don't actually need to declare your dependencies in a file called **deft.json**. You can name it anything, then specify the file to load with the `--config-file` option:

    deft --config-file depenencies.json

## The usual disclaimer

This project is brand new, lots of stuff could change, I could get hit by a bus and it'll never be updated, etc. etc.
