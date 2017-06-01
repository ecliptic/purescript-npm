#!/usr/bin/env node
/**
 * Refresh a package with the latest version from the upstream repository.
 */
const { adjust, curry, fromPairs, toPairs, map, repeat } = require('ramda')
const { execSync } = require('child_process')
const { join, resolve } = require('path')
const { writeFileSync } = require('fs')
const minimist = require('minimist')

const mapKeys = curry((fn, obj) => fromPairs(map(adjust(fn, 0), toPairs(obj))))

function main (args) {
  const packages = args._

  let errors = []

  packages.forEach(pkg => {
    const banner = `-- Refreshing ${pkg} `
    const line = repeat('-', 80 - banner.length).join('')
    console.log(`\n${banner}${line}\n`)

    const dir = resolve(__dirname, `../packages/${pkg}`)
    const withDir = join.bind(undefined, dir)

    const silent = { cwd: dir }
    const opts = Object.assign({}, silent, { stdio: 'inherit' })

    // Do a reset and pull from upstream
    execSync('git reset --hard', opts)
    execSync('git pull', opts)

    // Then, retrieve the Bower and NPM configs
    const bower = require(withDir('bower.json'))
    const npm = require(withDir('package.json'))

    const version = execSync('git describe --abbrev=0 --tags', silent)
      .toString()
      .trim()
      .replace('v', '')

    // Construct a new package by merging together dependencies and adjusting
    // a few things
    const newPkg = Object.assign(
      {},
      bower,
      { name: toNpmPackage(bower.name) },
      { version: version },
      { scripts: npm.scripts },
      {
        dependencies: Object.assign(
          {},
          npm.dependencies,
          mapKeys(toNpmPackage, bower.dependencies)
        ),
      },
      {
        devDependencies: Object.assign(
          {},
          npm.devDependencies,
          mapKeys(toNpmPackage, bower.devDependencies)
        ),
      }
    )

    writeFileSync(withDir('package.json'), JSON.stringify(newPkg, null, 2))

    // Check to see if the package needs to be published
    try {
      const latest = execSync(`npm show @purescript/${pkg} version`, silent)
        .toString()
        .trim()

      if (latest !== version) {
        console.log('Publishing...')

        try {
          execSync('npm publish', opts)
        } catch (error) {
          errors.push(pkg)
        }
      } else {
        console.log('Not publishing - same version.')
      }
    } catch (error) {
      // Try publishing the package - it may be new
      console.log('Publishing as a new package...')

      execSync('npm publish --access public', silent)
    }
  })

  if (errors.length) {
    console.log(
      `\nUnable to refresh the following packages: ${errors.join(', ')}`
    )
  }
}

function toNpmPackage (name) {
  if (name.indexOf('purescript-') !== -1) {
    return `@purescript/${name.replace('purescript-', '')}`
  } else {
    return name
  }
}

if (require.main === module) {
  main(minimist(process.argv.slice(2)))
}
