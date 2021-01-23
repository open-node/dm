# @open-node/dm
Dependency Injection Manager for Node.js

[![Build status](https://travis-ci.com/open-node/dm.svg?branch=master)](https://travis-ci.org/open-node/dm)
[![codecov](https://codecov.io/gh/open-node/dm/branch/master/graph/badge.svg)](https://codecov.io/gh/open-node/dm)

# Installation
<pre>npm i @open-node/dm --save</pre>

# Usage
<pre>
const _ = require('lodash');
const DM = require('@open-node/dm');

const dm = DM('js', _);

const deps = {};
dm.auto(dir, { ignores, deps, args });
</pre>
