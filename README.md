# Mgc-Coin

[![Build Status][circleci-status-img]][circleci-status-url]
[![Coverage Status][coverage-status-img]][coverage-status-url]

__NOTE__: The latest release of MagnaChain-Coin contains a non-backward compatible change
to the rest API. 

---

**Mgc-Coin** is an alternative implementation of the MagnaChain protocol, written in
node.js.

MagnaChain-Coin is well tested and aware of all known consensus rules. It is currently
used in production as the consensus backend and wallet system for
[purse.io][purse].

## Uses

- Full Node
- SPV Node
- Wallet Backend (bip44 derivation)
- Mining Backend (getblocktemplate support)
- Layer 2 Backend (lightning)
- General Purpose Bitcoin Library


## Install

```
$ git clone git://github.com/MagnaChain/Mgc-Coin.git
$ cd Mgc-Coin
$ npm install

```

See the [Getting started][guide] guide for more in-depth installation
instructions, including verifying releases.



## Disclaimer

Mgc-Coin does not guarantee you against theft or lost funds due to bugs, mishaps,
or your own incompetence. You and you alone are responsible for securing your
money.

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`