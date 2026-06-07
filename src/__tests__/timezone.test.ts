import { describe, it, expect } from 'vitest';
import { convertBirthToUTC } from '../astronomy/engine';
import { DateTime } from 'luxon';

function toISOWithoutMs(d: Date) {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

describe('Timezone conversions (IANA)', () => {
  it('America/Mexico_City conversion', () => {
    const bd: any = {
      name: 'Test',
      date: '2020-03-01',
      time: '12:00',
      city: 'Mexico City',
      latitude: 19.4326,
      longitude: -99.1332,
      timezoneId: 'America/Mexico_City',
      useManualCoords: false
    };
    const utc = convertBirthToUTC(bd);
    const expected = DateTime.fromObject({ year: 2020, month: 3, day: 1, hour: 12, minute: 0 }, { zone: 'America/Mexico_City' }).toUTC();
    expect(toISOWithoutMs(utc)).to.equal(toISOWithoutMs(expected.toJSDate()));
  });

  it('America/New_York conversion', () => {
    const bd: any = {
      name: 'Test',
      date: '2021-11-07', // DST transition date in US
      time: '01:30',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      timezoneId: 'America/New_York',
      useManualCoords: false
    };
    const utc = convertBirthToUTC(bd);
    const expected = DateTime.fromObject({ year: 2021, month: 11, day: 7, hour: 1, minute: 30 }, { zone: 'America/New_York' }).toUTC();
    expect(toISOWithoutMs(utc)).to.equal(toISOWithoutMs(expected.toJSDate()));
  });

  it('Europe/Madrid conversion', () => {
    const bd: any = {
      name: 'Test',
      date: '2019-10-27', // DST end in Europe
      time: '02:15',
      city: 'Madrid',
      latitude: 40.4168,
      longitude: -3.7038,
      timezoneId: 'Europe/Madrid',
      useManualCoords: false
    };
    const utc = convertBirthToUTC(bd);
    const expected = DateTime.fromObject({ year: 2019, month: 10, day: 27, hour: 2, minute: 15 }, { zone: 'Europe/Madrid' }).toUTC();
    expect(toISOWithoutMs(utc)).to.equal(toISOWithoutMs(expected.toJSDate()));
  });

  it('Asia/Kolkata conversion (UTC+5:30)', () => {
    const bd: any = {
      name: 'Test',
      date: '2022-05-15',
      time: '09:45',
      city: 'Kolkata',
      latitude: 22.5726,
      longitude: 88.3639,
      timezoneId: 'Asia/Kolkata',
      useManualCoords: false
    };
    const utc = convertBirthToUTC(bd);
    const expected = DateTime.fromObject({ year: 2022, month: 5, day: 15, hour: 9, minute: 45 }, { zone: 'Asia/Kolkata' }).toUTC();
    expect(toISOWithoutMs(utc)).to.equal(toISOWithoutMs(expected.toJSDate()));
  });
});
