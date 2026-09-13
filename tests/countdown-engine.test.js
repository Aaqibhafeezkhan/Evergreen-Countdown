const assert = require('node:assert/strict');
const test = require('node:test');
const engine = require('../countdown-engine.js');

test('default target advances to the next year after January 1', () => {
    assert.equal(
        engine.getDefaultTargetDate(new Date('2026-01-01T12:00:00Z')),
        '2027-01-01T00:00:00Z'
    );
    assert.equal(
        engine.getDefaultTargetDate(new Date('2026-12-31T23:59:59Z')),
        '2027-01-01T00:00:00Z'
    );
});

test('remaining time is split into stable non-negative units', () => {
    const remaining = engine.getRemaining(10_000, 0);

    assert.deepEqual(remaining, {
        expired: false,
        totalMilliseconds: 10_000,
        totalSeconds: 10,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 10
    });
});

test('expired targets clamp remaining time to zero', () => {
    const remaining = engine.getRemaining(999, 1_000);

    assert.equal(remaining.expired, true);
    assert.equal(remaining.totalMilliseconds, 0);
    assert.equal(remaining.totalSeconds, 0);
    assert.equal(remaining.days, 0);
    assert.equal(remaining.hours, 0);
    assert.equal(remaining.minutes, 0);
    assert.equal(remaining.seconds, 0);
});

test('timezone-less targets resolve using the requested IANA timezone', () => {
    const target = engine.parseTargetDate('2030-01-01T00:00:00', 'Asia/Kolkata');
    assert.equal(new Date(target).toISOString(), '2029-12-31T18:30:00.000Z');
});

test('explicit offsets take precedence over timezone conversion', () => {
    const target = engine.parseTargetDate('2030-01-01T00:00:00+05:30', 'America/New_York');
    assert.equal(new Date(target).toISOString(), '2029-12-31T18:30:00.000Z');
});

test('invalid timezone is rejected by target parsing', () => {
    assert.equal(Number.isNaN(engine.parseTargetDate('2030-01-01T00:00:00', 'Not/A-Timezone')), true);
});

test('invalid target input falls back to the deterministic default configuration', () => {
    const config = engine.resolveConfig({
        targetDate: 'not-a-date',
        timezone: 'Not/A-Timezone',
        label: '  Demo  ',
        title: '  Example  ',
        completionMessage: '  Complete  '
    }, new Date('2026-09-14T05:00:00Z'));

    assert.equal(config.targetDate, 'not-a-date');
    assert.equal(config.targetTime, Date.parse('2027-01-01T00:00:00Z'));
    assert.equal(config.timezone, 'UTC');
    assert.equal(config.label, 'Demo');
    assert.equal(config.title, 'Example');
    assert.equal(config.completionMessage, 'Complete');
});

test('text configuration uses safe fallbacks for blank values', () => {
    const config = engine.resolveConfig({
        targetDate: '2030-01-01T00:00:00Z',
        label: '   ',
        title: '',
        completionMessage: '   '
    });

    assert.equal(config.label, 'Official Countdown');
    assert.equal(config.title, 'Countdown');
    assert.equal(config.completionMessage, 'A new beginning has arrived.');
});
