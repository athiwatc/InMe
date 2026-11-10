const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const asset = name => readFileSync(path.join(root, 'public/js', name), 'utf8');

async function app(t, { bootstrap = 'bootstrap.min.js', token = '', main = true, fullName = 'Test User' } = {}) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  const template = readFileSync(path.join(root, 'app/views/main.scala.html'), 'utf8')
    .replace(/^@\([^\n]+\)\s*/, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
    .replace('@content', '');
  const dom = new JSDOM(template, {
    url: 'https://inme.example/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole: console
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.eval(asset('jquery.min.js'));
  w.eval(asset(bootstrap));
  w.eval(asset('agility.min.js'));
  await new Promise(resolve => w.jQuery(resolve));
  w.jQuery.support.transition = false;
  const requests = [];
  w.jQuery.ajax = options => {
    requests.push(options);
    assert.equal(options.dataType, 'jsonp');
    if (options.url.includes('/feed/')) {
      options.success({
        pagination: { next_url: 'https://api.instagram.com/v1/users/self/feed/?page=2' },
        data: [{ images: { low_resolution: { url: 'https://images.example/photo.jpg' } } }]
      });
    } else {
      options.success({ data: { full_name: fullName, username: 'testuser' } });
    }
  };
  w.ClientID = 'test-client';
  w.ServerToken = token;
  if (main) w.eval(asset('main.js'));
  t.after(() => assert.deepEqual(errors, []));
  return { w, $: w.jQuery, requests };
}

test('jQuery asset is the unmodified official 3.7.1 release', () => {
  const digest = createHash('sha256').update(asset('jquery.min.js')).digest('base64');
  assert.equal(digest, '/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=');
});

test('jQuery rejects prototype pollution during deep extend', async t => {
  const { w, $ } = await app(t, { main: false });
  const malicious = w.JSON.parse('{"__proto__":{"polluted":true}}');
  const result = $.extend(true, {}, malicious);
  assert.equal(result.polluted, undefined);
  assert.equal(w.Object.prototype.polluted, undefined);
  assert.equal($.fn.jquery, '3.7.1');
});

test('jQuery does not rewrite self-closing HTML through the old htmlPrefilter', async t => {
  const { $ } = await app(t, { main: false });
  const html = '<style><style/><img src=x onerror=alert(1)>';
  assert.equal($.htmlPrefilter(html), html);
});

for (const bootstrap of ['bootstrap.js', 'bootstrap.min.js']) {
  test(`${bootstrap}: logged-out page shows the login link`, async t => {
    const { $, requests } = await app(t, { bootstrap });
    assert.equal($('#loginBox').prop('hidden'), false);
    assert.equal($('#logoutBox').prop('hidden'), true);
    const login = new URL($('#loginBtn').attr('href'));
    assert.equal(login.origin, 'https://instagram.com');
    assert.equal(login.searchParams.get('client_id'), 'test-client');
    assert.equal(login.searchParams.get('redirect_uri'), 'https://inme.example/');
    assert.equal(requests.length, 0);
  });

  test(`${bootstrap}: feed, username, and pagination still render`, async t => {
    const { w, $, requests } = await app(t, { bootstrap, token: 'test-token' });
    assert.equal($('#username').text(), 'Test User');
    assert.equal($('#logoutBox').prop('hidden'), false);
    assert.equal($('#loginBox').prop('hidden'), true);
    assert.equal($('img').length, 1);
    assert.equal(w.container.size(), 1);
    $(w).trigger('scroll');
    assert.equal($('img').length, 2);
    assert.equal(w.container.size(), 2);
    assert.equal(requests.length, 3);
    assert.match(requests[2].url, /page=2$/);
    assert.equal(w.isLoading, false);
  });

  test(`${bootstrap}: profile without full name uses username`, async t => {
    const { $ } = await app(t, { bootstrap, token: 'test-token', fullName: '' });
    assert.equal($('#username').text(), 'testuser');
  });

  test(`${bootstrap}: dropdown supports repeated opening and closing`, async t => {
    const { $ } = await app(t, { bootstrap, token: 'test-token' });
    const toggle = $('#logoutBox [data-toggle="dropdown"]');
    toggle.trigger('click');
    assert.equal($('#logoutBox').hasClass('open'), true);
    toggle.trigger('click');
    assert.equal($('#logoutBox').hasClass('open'), false);
    toggle.trigger('click');
    $('html').trigger('click');
    assert.equal($('#logoutBox').hasClass('open'), false);
  });

  test(`${bootstrap}: collapse supports repeated show and hide`, async t => {
    const { $ } = await app(t, { bootstrap, main: false });
    const panel = $('<div class="collapse">Navigation</div>').appendTo('body');
    panel.collapse({ toggle: false });
    for (let i = 0; i < 2; i++) {
      panel.collapse('show');
      assert.equal(panel.hasClass('in'), true);
      panel.collapse('hide');
      assert.equal(panel.hasClass('in'), false);
    }
  });

  test(`${bootstrap}: alert with placeholder link can be dismissed`, async t => {
    const { $ } = await app(t, { bootstrap, main: false });
    const alert = $('<div class="alert"><a data-dismiss="alert" href="#">Close</a></div>').appendTo('body');
    alert.find('a').trigger('click');
    assert.equal(alert[0].isConnected, false);
  });

  test(`${bootstrap}: typeahead initializes and handles keyboard selection`, async t => {
    const { $ } = await app(t, { bootstrap, main: false });
    const input = $('<input>').appendTo('body').typeahead({ source: ['Alpine', 'Alpha', 'Beta'] });
    input.val('Al').trigger($.Event('keyup', { keyCode: 76 }));
    const typeahead = input.data('typeahead');
    assert.equal(typeahead.shown, true);
    assert.equal(typeahead.$menu.find('li').length, 2);
    input.trigger($.Event('keydown', { keyCode: 40 }));
    input.trigger($.Event('keyup', { keyCode: 13 }));
    assert.equal(input.val(), 'Alpha');
    assert.equal(typeahead.shown, false);
  });
}

test('Agility supports styled views, bindings, updates, and child removal', async t => {
  const { w } = await app(t, { main: false });
  // Construct model values inside the browser realm, as real application code does.
  w.eval(`
    var view = $$({name: 'Initial'}, '<div><span data-bind="name"></span></div>', '& {color:red}');
    $$.document.append(view);
    var child = $$({}, '<img src="https://images.example/child.jpg">');
    view.append(child);
  `);
  assert.equal(w.view.view.$('span').text(), 'Initial');
  assert.equal(w.view.size(), 1);
  assert.equal(w.view.model.size(), 1);
  assert.match(w.view.view.$().attr('class'), /agility_/);
  w.eval("view.model.set({name: 'Updated'})");
  assert.equal(w.view.view.$('span').text(), 'Updated');
  w.child.destroy();
  assert.equal(w.view.size(), 0);
});
