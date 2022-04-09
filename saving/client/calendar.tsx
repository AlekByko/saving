import * as React from 'react';
import { addDay, toFirstDateOfMonth, toFirstDateOfNextWeek, toFirstDateOfWeek, toLastDateOfMonth } from './shared/time';

export class Calendar {
    constructor() {
    }
    render() {
        const now = new Date();
        const first = toFirstDateOfMonth(now);
        const last = toLastDateOfMonth(now);
        const start = toFirstDateOfWeek(first);
        const finishTime = toFirstDateOfNextWeek(last).getTime();
        let at = start;
        interface Week {
            key: string;
            days: JSX.Element[];
        }
        const weeks: Week[] = [];
        let week: Week = { key: at.toString(), days: [] };
        while (at.getTime() < finishTime) {
            const text = at.getDate();
            const day = <div key={at.toString()}>{text}</div>;
            week.days.push(day);
            at = addDay(at, 1);
            if (week.days.length >= 7) {
                weeks.push(week);
                week = { key: at.toString(), days: [] };
            }
        }
        return <div className="calendar">
            {weeks.map(({key, days}) => {
                return <div key={key} className="week">
                    {days}
                </div>;
            })}
        </div>;
    }
}
