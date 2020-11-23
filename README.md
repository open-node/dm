# @open-node/dm
Dependency Injection Manager for Node.js

[![Build status](https://travis-ci.com/open-node/dm.svg?branch=master)](https://travis-ci.org/open-node/dm)
[![codecov](https://codecov.io/gh/open-node/dm/branch/master/graph/badge.svg)](https://codecov.io/gh/open-node/dm)

# Installation
<pre>npm i @open-node/dm --save</pre>

# Usage
<pre>
const dm = require('@open-node/dm');

const DM = Logger({ errorLogPath, infoLogPath });
const dm = DM('js');

const deps = {};
dm.auto(dir, ignores, deps, args);
</pre>
