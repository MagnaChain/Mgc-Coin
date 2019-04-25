/*!
 * abstractblock.js - abstract block object for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const assert = require('assert');
const util = require('../utils/util');
const digest = require('../crypto/digest');
const StaticWriter = require('../utils/staticwriter');
const InvItem = require('./invitem');
const encoding = require('../utils/encoding');
const consensus = require('../protocol/consensus');
const WriteBuffer = require('../utils/writer');

/**
 * The class which all block-like objects inherit from.
 * @alias module:primitives.AbstractBlock
 * @constructor
 * @abstract
 * @property {Number} version - Block version. Note
 * that Bcoin reads versions as unsigned despite
 * them being signed on the protocol level. This
 * number will never be negative.
 * @property {Hash} prevBlock - Previous block hash.
 * @property {Hash} merkleRoot - Merkle root hash.
 * @property {Number} ts - Timestamp.
 * @property {Number} bits
 * @property {Number} nonce
 * @property {TX[]} txs - Transaction vector.
 * @property {ReversedHash} rhash - Reversed block hash (uint256le).
 */

function AbstractBlock() {
  if (!(this instanceof AbstractBlock))
    return new AbstractBlock();

  this.version = 1;
  this.prevHash = encoding.NULL_HASH;
  this.merkleRoot = encoding.NULL_HASH;
  this.hashMerkleRootWithData = encoding.NULL_HASH;
  this.hashMerkleRootWithPrevData = encoding.NULL_HASH;
  this.time = 0;
  this.bits = 0;
  this.nonce = 0;
  this.outpointhash = encoding.NULL_HASH;
  this.outpointn = 0;
  this.blocksigsize = 0;
  this.blocksig = null;
  

  this.txs = null;
  this.groupSize = null;
  this.prevContractData = null;
  
  this.mutable = false;

  this._hash = null;
  this._hhash = null;
  this._size = -1;
  this._witness = -1;
}

/**
 * Memory flag.
 * @const {Boolean}
 * @default
 * @memberof AbstractBlock#
 */

AbstractBlock.prototype.memory = false;

/**
 * Inject properties from options object.
 * @private
 * @param {NakedBlock} options
 */

AbstractBlock.prototype.parseOptions = function parseOptions(options) {
  assert(options, 'Block data is required.');
  assert(util.isNumber(options.version));
  assert(typeof options.prevHash === 'string');
  assert(typeof options.merkleRoot === 'string');
  assert(typeof options.hashMerkleRootWithData === 'string');
  assert(typeof options.hashMerkleRootWithPrevData === 'string');
  
  assert(util.isNumber(options.time));
  assert(util.isNumber(options.bits));
  assert(util.isNumber(options.nonce));

  this.version = options.version;
  this.prevHash = options.prevHash;
  this.merkleRoot = options.merkleRoot;
  this.hashMerkleRootWithData = options.hashMerkleRootWithData;
  this.hashMerkleRootWithPrevData = options.hashMerkleRootWithPrevData;
  
  this.time = options.time;
  this.bits = options.bits;
  this.nonce = options.nonce;

  this.outpointhash = options.outpointhash;
  this.outpointn = options.outpointn;
  this.blocksigsize = options.blocksigsize;
  this.blocksig = options.blocksig;
  
  if (options.mutable != null)
    this.mutable = !!options.mutable;

  return this;
};

/**
 * Inject properties from json object.
 * @private
 * @param {Object} json
 */

AbstractBlock.prototype.parseJSON = function parseJSON(json) {
  assert(options, 'Block data is required.');
  assert(util.isNumber(options.version));
  assert(typeof options.prevHash === 'string');
  assert(typeof options.merkleRoot === 'string');
  assert(typeof options.hashMerkleRootWithData === 'string');
  assert(typeof options.hashMerkleRootWithPrevData === 'string');
  
  assert(util.isNumber(options.time));
  assert(util.isNumber(options.bits));
  assert(util.isNumber(options.nonce));

  this.version = options.version;
  this.prevHash = options.prevHash;
  this.merkleRoot = options.merkleRoot;
  this.hashMerkleRootWithData = options.hashMerkleRootWithData;
  this.hashMerkleRootWithPrevData = options.hashMerkleRootWithPrevData;
  
  this.time = options.time;
  this.bits = options.bits;
  this.nonce = options.nonce;

  this.outpointhash = options.outpointhash;
  this.outpointn = options.outpointn;
  this.blocksigsize = options.blocksigsize;
  this.blocksig = options.blocksig;

  return this;
};

/**
 * Clear any cached values (abstract).
 * @param {Boolean?} all - Clear transactions.
 */

AbstractBlock.prototype._refresh = function refresh(all) {
  this._hash = null;
  this._hhash = null;
  this._size = -1;
  this._witness = -1;

  if (!all)
    return;

  if (!this.txs)
    return;

  for (let tx of this.txs)
    tx.refresh();
};

/**
 * Clear any cached values.
 * @param {Boolean?} all - Clear transactions.
 */

AbstractBlock.prototype.refresh = function refresh(all) {
  return this._refresh(all);
};

/**
 * Hash the block headers.
 * @param {String?} enc - Can be `'hex'` or `null`.
 * @returns {Hash|Buffer} hash
 */

AbstractBlock.prototype.hash = function _hash(enc) {
  let hash = this._hash;

  if (!hash) {
    hash = digest.hash256(this.abbr());
    if (!this.mutable)
      this._hash = hash;
  }

  if (enc === 'hex') {
    let hex = this._hhash;
    if (!hex) {
      hex = hash.toString('hex');
      if (!this.mutable)
        this._hhash = hex;
    }
    hash = hex;
  }

  return hash;
};

/**
 * Serialize the block headers.
 * @returns {Buffer}
 */

AbstractBlock.prototype.abbr = function abbr() {
  //return this.writeAbbr(new StaticWriter(256)).render();
  return this.writeAbbr(new WriteBuffer()).render();
};

/**
 * Serialize the block headers.
 * @param {BufferWriter} bw
 */

AbstractBlock.prototype.writeAbbr = function writeAbbr(bw) {
  bw.writeU32(this.version);
  bw.writeHash(this.prevHash);
  bw.writeHash(this.merkleRoot);
  bw.writeHash(this.hashMerkleRootWithData);
  bw.writeHash(this.hashMerkleRootWithPrevData);
   
  bw.writeU32(this.time);
  bw.writeU32(this.bits);
  bw.writeU32(this.nonce);
  
  bw.writeHash(this.outpointhash);
  bw.write32(this.outpointn);
  bw.writeVarint(this.blocksigsize);
  bw.writeString(this.blocksig,'binary');
  
  return bw;
};

/**
 * Parse the block headers.
 * @param {BufferReader} br
 */

AbstractBlock.prototype.parseAbbr = function parseAbbr(br) {
  this.version = br.readU32();
  console.log("################### AbstractBlock parseAbbr version:" +  this.version );
  this.prevHash = br.readHash('hex');
  //console.log("################### AbstractBlock parseAbbr prevHash:" + this.prevHash );
  
  this.merkleRoot = br.readHash('hex');
  this.hashMerkleRootWithData = br.readHash('hex');
  this.hashMerkleRootWithPrevData = br.readHash('hex');
  
  this.time = br.readU32();
  //console.log("################### AbstractBlock parseAbbr this.time:" +  this.time );
  this.bits = br.readU32();
  //console.log("################### AbstractBlock parseAbbr this.bits:" +  this.bits );
  this.nonce = br.readU32();
  //console.log("################### AbstractBlock parseAbbr this.nonce:" +  this.nonce );
  
  this.outpointhash = br.readHash('hex');
  this.outpointn = br.read32();
  //console.log("################### AbstractBlock parseAbbr this.outpointn:" +  this.outpointn );
  this.blocksigsize = br.readVarint();
  console.log("################### AbstractBlock parseAbbr this.blocksigsize:" +  this.blocksigsize );
  this.blocksig = br.readString('binary',this.blocksigsize);
  
  return this;
};

/**
 * Verify the block.
 * @returns {Boolean}
 */

AbstractBlock.prototype.verify = function verify() {
  if (!this.verifyPOW())
    return false;

  if (!this.verifyBody())
    return false;

  return true;
};

/**
 * Verify proof-of-work.
 * @returns {Boolean}
 */

AbstractBlock.prototype.verifyPOW = function verifyPOW() {
  return consensus.verifyPOW(this.hash(), this.bits);
};

/**
 * Verify the block.
 * @returns {Boolean}
 */

AbstractBlock.prototype.verifyBody = function verifyBody() {
  throw new Error('Abstract method.');
};

/**
 * Get little-endian block hash.
 * @returns {Hash}
 */

AbstractBlock.prototype.rhash = function rhash() {
  return util.revHex(this.hash('hex'));
};

/**
 * Convert the block to an inv item.
 * @returns {InvItem}
 */

AbstractBlock.prototype.toInv = function toInv() {
  return new InvItem(InvItem.types.BLOCK, this.hash('hex'));
};

/*
 * Expose
 */

module.exports = AbstractBlock;
