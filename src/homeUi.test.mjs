import assert from 'node:assert/strict';
import test from 'node:test';

import {
  compactTitleVisible,
  gridPageHeight,
  pagerViewportHeight,
  swipeCategory,
} from './homeUi.ts';

const categories = ['all', 'digital', 'home', 'transport'];

test('compact title stays hidden until the large title has scrolled away', () => {
  assert.equal(compactTitleVisible(55), false);
  assert.equal(compactTitleVisible(56), true);
});

test('horizontal swipe on the category strip selects the adjacent category', () => {
  assert.equal(swipeCategory(categories, 'digital', -64, 8), 'home');
  assert.equal(swipeCategory(categories, 'digital', 64, 8), 'all');
});

test('vertical or short movement does not switch the category', () => {
  assert.equal(swipeCategory(categories, 'digital', -30, 3), 'digital');
  assert.equal(swipeCategory(categories, 'digital', -64, 80), 'digital');
});

test('category swipe stops at either end', () => {
  assert.equal(swipeCategory(categories, 'all', 64, 2), 'all');
  assert.equal(swipeCategory(categories, 'transport', -64, 2), 'transport');
});

test('grid page height covers every row of square cards', () => {
  assert.equal(gridPageHeight(0, 180, 10), 180);
  assert.equal(gridPageHeight(1, 180, 10), 180);
  assert.equal(gridPageHeight(2, 180, 10), 180);
  assert.equal(gridPageHeight(3, 180, 10), 370);
  assert.equal(gridPageHeight(4, 180, 10), 370);
});

test('pager viewport is stable across pages so paging never resizes the scroll content', () => {
  assert.equal(pagerViewportHeight([180, 370, 560], 400), 560);
  assert.equal(pagerViewportHeight([820, 180], 400), 820);
});

test('pager viewport always leaves enough content to scroll the overview away', () => {
  assert.equal(pagerViewportHeight([180], 500), 500);
  assert.equal(pagerViewportHeight([], 500), 500);
});
