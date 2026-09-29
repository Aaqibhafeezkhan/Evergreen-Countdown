const assert = require('node:assert/strict');
const test = require('node:test');
const engine = require('../countdown-engine.js');

test('explicit offsets remain absolute regardless of requested timezone', () => {
    const target = engine.parseTargetDate('2030-07-01T12:00:00+05:30', 'America/New_York');
    assert.equal(new Date(target).toISOString(), '2030-07-01T06:30:00.000Z');
});

test('DST-aware timezone targets resolve to the local wall-clock instant', () => {
    const target = engine.parseTargetDate('2030-07-01T12:00:00', 'America/New_York');
    assert.equal(new Date(target).toISOString(), '2030-07-01T16:00:00.000Z');
});

test('configuration precedence keeps explicit target dates ahead of defaults', () => {
    const config = engine.resolveConfig({
        targetDate: '2030-06-15T18:30:00Z',
        timezone: 'Asia/Kolkata',
        label: 'Launch',
        title: 'Product Launch',
        completionMessage: 'Ready'
    });
    assert.equal(config.targetTime, Date.parse('2030-06-15T18:30:00Z'));
    assert.equal(config.timezone, 'Asia/Kolkata');
    assert.equal(config.label, 'Launch');
});

test('expired targets remain stable at zero', () => {
    const remaining = engine.getRemaining(Date.parse('2020-01-01T00:00:00Z'), Date.parse('2026-09-29T00:00:00Z'));
    assert.equal(remaining.expired, true);
    assert.equal(remaining.totalMilliseconds, 0);
    assert.equal(remaining.seconds, 0);
});

test('text normalization bounds values without allowing blank output', () => {
    const config = engine.resolveConfig({
        targetDate: '2030-01-01T00:00:00Z',
        label: '   <Launch>   ',
        title: '   ',
        completionMessage: 'Done'
    });
    assert.equal(config.label, '<Launch>');
    assert.equal(config.title, 'Countdown');
    assert.equal(config.completionMessage, 'Done');
});
