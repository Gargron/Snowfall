/**
 * Copyright (c) 2013 Eugen Rochko
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (window) {
  'use strict';

  var Flake, Snowfall;

  Snowfall = function (max) {
    if (typeof max === "undefined") {
      max = 300;
    }

    if (!window.HTMLCanvasElement) {
      console.warn('Snowfall.js is aborting due to the browser not supporting <canvas>');
      return;
    }

    this.max    = max;
    this.flakes = [];

    this.createCanvas();
    this.generateFlakes();
    this.registerAnimation();
    this.bindDOMEvents();
  };

  Snowfall.prototype.createCanvas = function () {
    this.canvas = document.createElement('canvas');
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext('2d');

    this.canvas.setAttribute('style', 'position: absolute; top: 0; left: 0; z-index: 99999; pointer-events: none');
    document.body.appendChild(this.canvas);
  };

  Snowfall.prototype.bindDOMEvents = function () {
    var throttle, that;

    that = this;

    window.addEventListener('resize', function () {
      if (typeof throttle === "undefined") {
        throttle = window.setTimeout(function () {
          throttle = undefined;
          that.canvas.width  = window.innerWidth;
          that.canvas.height = window.innerHeight;
        }, 100);
      }
    }, false);
  };

  Snowfall.prototype.generateFlakes = function () {
    var i;

    for (i = 0; i < this.max; i += 1) {
      this.flakes.push(new Flake(Math.floor(Math.random() * this.canvas.width), Math.floor(Math.random() * this.canvas.height * 0.45)));
    }
  };

  Snowfall.prototype.updateFlakes = function (delta) {
    var i, len;

    for (i = 0, len = this.flakes.length; i < len; i += 1) {
      this.flakes[i].move(delta);

      if (!this.flakes[i].isVisible(this.canvas.width, this.canvas.height)) {
        this.flakes.splice(i, 1);
        this.flakes.push(new Flake(Math.floor(Math.random() * this.canvas.width), 0));
      }
    }
  };

  Snowfall.prototype.drawFrame = function () {
    var i, len;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = 'rgba(255, 255, 255, 0.5)';

    for (i = 0, len = this.flakes.length; i < len; i += 1) {
      this.context.fillRect(this.flakes[i].x, this.flakes[i].y, this.flakes[i].size, this.flakes[i].size);
    }
  };

  Snowfall.prototype.registerAnimation = function () {
    var last_run, frame, that;

    if (typeof window.requestAnimationFrame === "undefined") {
      var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

      if (typeof requestAnimationFrame === "undefined") {
        console.warn("Snowfall.js is falling back to 100ms animation intervals");

        requestAnimationFrame = function (callback) {
          return window.setTimeout(callback, 100);
        };
      }

      window.requestAnimationFrame = requestAnimationFrame;
    }

    last_run = new Date().getTime();
    that     = this;

    frame = function (now) {
      that.updateFlakes(now - last_run);
      that.drawFrame();

      last_run = now;
      that.animation = window.requestAnimationFrame(frame);
    };

    this.animation = window.requestAnimationFrame(frame);
  };

  Snowfall.prototype.removeAnimation = function () {
    if (typeof this.animation === "undefined") {
      return;
    }

    window.cancelAnimationFrame(this.animation);
  };

  Flake = function (x, y) {
    this.x = x;
    this.y = y;
    this.setSpeed();
    this.setSize();
  };

  Flake.prototype.setSpeed = function () {
    this.speed = Math.max(0.1, Math.random() * 0.5);
  };

  Flake.prototype.setSize = function () {
    this.size = Math.max(1, Math.floor(Math.random() * 4));
  };

  Flake.prototype.move = function (delta) {
    this.y += delta * this.speed;
  };

  Flake.prototype.isVisible = function (bx, by) {
    return (this.x > 0 && this.y > 0 && this.x < bx && this.y < by);
  };

  window.Snowfall = new Snowfall(300);
} (window));
