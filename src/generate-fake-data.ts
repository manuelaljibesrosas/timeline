import { faker } from "@faker-js/faker";
import randomColor from "randomcolor";
import { set } from "date-fns";
import { TimelineGroupBase, TimelineItem } from "react-calendar-timeline";

function generateFakeData(groupCount = 10, itemCount = 1000) {
  const randomSeed = Math.floor(Math.random() * 1000);
  const groups: Array<TimelineGroupBase> = [];

  for (let i = 0; i < groupCount; i++) {
    groups.push({
      id: `${i + 1}`,
      title: `${faker.person.firstName()} ${faker.person.lastName()[0]}.`,
      stackItems: false,
    });
  }

  const items: Array<
    TimelineItem<{
      start: number;
      end: number;
      bgColor: string;
      location: string;
      description: string;
    }>
  > = [];

  for (let i = 0; i < groupCount; i++)
    for (let j = 0; j < itemCount; j++) {
      const startDate =
        (j === 0
          ? set(Date.now(), { hours: 0, minutes: 0, seconds: 0 }).valueOf()
          : items[itemCount * i + j - 1].end_time) +
        Math.round(1 + Math.random() * 3) * 1000 * 60 * 60;
      const endDate =
        startDate + Math.round(3 + Math.random() * 5) * 1000 * 60 * 60;

      items.push({
        id: `${i}=${j}`,
        group: groups[i].id,
        title: `${faker.hacker.ingverb()} ${faker.hacker.noun()}`,
        location: `${faker.location.streetAddress()}`,
        start_time: startDate.valueOf(),
        end_time: endDate.valueOf(),
        start: startDate.valueOf(),
        end: endDate.valueOf(),
        canMove: false,
        canResize: "both",
        description: faker.lorem.paragraph(3),
        bgColor: randomColor({
          luminosity: "light",
          seed: randomSeed + i,
          format: "rgba",
          alpha: 1,
        }),
      });
    }

  return { groups, items };
}

export default generateFakeData;
