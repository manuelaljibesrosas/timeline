import React, { useMemo } from "react";
import moment from "moment";
import randomColor from "randomcolor";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TimelineItem as TTimelineItem,
  TimelineMarkers,
  TodayMarker,
  Id,
  TimelineTimeSteps,
} from "react-calendar-timeline";
import generateFakeData from "./generate-fake-data";
import { Spring, animated, SpringValue } from "react-spring";
import TimelineItem from "./components/TimelineItem";
import GroupItem from "./components/GroupItem";
import EditEntryForm from "./components/EditEntryForm";

export const TimelineContext = React.createContext<null | {
  setSelectedItem: (item: TTimelineItem<any>) => void;
  selectedItem: TTimelineItem<any> | null;
  removeItem: (id: Id) => void;
  updateItem: (item: TTimelineItem<any>) => void;
}>(null);

const AnimatedTimeline = animated((props: ComponentProps<typeof Timeline>) => (
  <Timeline {...props} />
));

const keys = {
  groupIdKey: "id",
  groupTitleKey: "title",
  groupRightTitleKey: "rightTitle",
  itemIdKey: "id",
  itemTitleKey: "title",
  itemDivTitleKey: "title",
  itemGroupKey: "group",
  itemTimeStartKey: "start",
  itemTimeEndKey: "end",
};

const timeSteps: TimelineTimeSteps = {
  second: 1,
  minute: 1,
  day: 1,
  month: 1,
  year: 1,
  hour: 3,
};

const noop = () => undefined;

const defaultTimeStart = moment().startOf("day").toDate().valueOf();
const defaultTimeEnd = moment().startOf("day").add(1, "day").toDate().valueOf();

const App: React.FC = () => {
  const [items, setItems] = useState<
    ReturnType<typeof generateFakeData>["items"]
  >([]);
  const [groups, setGroups] = useState<
    ReturnType<typeof generateFakeData>["groups"]
  >([]);
  const [selectedItem, setSelectedItem] = useState<
    ReturnType<typeof generateFakeData>["items"][0] | null
  >(null);
  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultTimeStart);
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultTimeEnd);
  const [selected, setSelected] = useState<Array<Id>>([]);

  useEffect(() => {
    setSelected(items.map(({ id }) => id));
  }, [items]);

  useEffect(() => {
    const { items, groups } = generateFakeData();

    setItems(items);
    setGroups(groups);
  }, []);

  const updateItem = useCallback(
    (item: ReturnType<typeof generateFakeData>["items"][0]) => {
      setItems((items) => {
        const index = items.findIndex(({ id }) => id === item.id);
        const updatedItemsList = items.slice();
        updatedItemsList.splice(index, 1, item);
        return updatedItemsList;
      });
    },
    []
  );

  const removeItem = useCallback((id: TTimelineItem<{}>["id"]) => {
    setItems((items) => {
      const index = items.findIndex((item) => id === item.id);
      const updatedItemsList = items.slice();
      updatedItemsList.splice(index, 1);
      return updatedItemsList;
    });
  }, []);

  const moveResizeValidator = useCallback<
    NonNullable<ComponentProps<typeof Timeline>["moveResizeValidator"]>
  >(
    (action, item, time, edge) => {
      if (action === "move") return -1;

      const index = items.findIndex(({ id }) => id === (item as any).id);
      if (index === -1) return time;
      const selectedItem = items[index];
      const itemsInGroup = items.filter(
        ({ group }) => group === selectedItem.group
      );
      let previousItem: (typeof items)[0] | null | any = null;
      let nextItem: (typeof items)[0] | null | any = null;

      itemsInGroup.forEach((item) => {
        if (
          item.end_time < selectedItem.start_time &&
          (previousItem === null || previousItem.end_time < item.end_time)
        )
          previousItem = item;
        if (
          item.start_time > selectedItem.end_time &&
          (nextItem === null || nextItem.start_time > item.start_time)
        )
          nextItem = item;
      });

      if (edge === "right")
        return nextItem === null ? time : Math.min(nextItem.start_time, time);
      else
        return previousItem === null
          ? time
          : Math.max(previousItem.end_time, time);
    },
    [items]
  );

  const onItemResize = useCallback<
    NonNullable<ComponentProps<typeof Timeline>["onItemResize"]>
  >(
    (itemId, time, edge) =>
      setItems((items) => {
        const index = items.findIndex((item) => item.id === itemId);
        const selectedItem = items[index];
        const itemsInGroup = items.filter(
          ({ group }) => group === selectedItem.group
        );
        let previousItem: (typeof items)[0] | null | any = null;
        let nextItem: (typeof items)[0] | null | any = null;

        itemsInGroup.forEach((item) => {
          if (
            item.end_time < selectedItem.start_time &&
            (previousItem === null || previousItem.end_time < item.end_time)
          )
            previousItem = item;
          if (
            item.start_time > selectedItem.end_time &&
            (nextItem === null || nextItem.start_time > item.start_time)
          )
            nextItem = item;
        });

        const updatedItem = {
          ...selectedItem,
          start:
            edge === "left"
              ? previousItem === null
                ? time
                : Math.max(previousItem.end_time, time)
              : selectedItem.start_time,
          start_time:
            edge === "left"
              ? previousItem === null
                ? time
                : Math.max(previousItem.end_time, time)
              : selectedItem.start_time,
          end:
            edge === "right"
              ? nextItem === null
                ? time
                : Math.min(nextItem.start_time, time)
              : selectedItem.end_time,
          end_time:
            edge === "right"
              ? nextItem === null
                ? time
                : Math.min(nextItem.start_time, time)
              : selectedItem.end_time,
        };

        const newItems = items.slice();
        newItems[index] = updatedItem;

        return newItems;
      }),
    []
  );

  const onCanvasClick = useCallback<
    NonNullable<ComponentProps<typeof Timeline>["onCanvasClick"]>
  >(
    (groupId, time) => {
      const itemsInGroup = items.filter(({ group }) => group === groupId);
      let previousItem: (typeof items)[0] | null = null;
      let nextItem: (typeof items)[0] | null = null;

      itemsInGroup.forEach((item) => {
        if (
          item.end_time < time &&
          (previousItem === null || previousItem.end_time < item.end_time)
        )
          previousItem = item;
        if (
          item.start_time > time &&
          (nextItem === null || nextItem.start_time > item.start_time)
        )
          nextItem = item;
      });

      const newItem = {
        id: Math.random() * 10000,
        group: groupId,
        title: "new task",
        location: "location",
        start_time: time,
        end_time:
          nextItem === null ||
          (nextItem as (typeof items)[0]).start_time > time + 1000 * 60 * 60 * 3
            ? time + 1000 * 60 * 60 * 3
            : (nextItem as (typeof items)[0]).start_time,
        start: time,
        end:
          nextItem === null ||
          (nextItem as (typeof items)[0]).start_time > time + 1000 * 60 * 60 * 3
            ? time + 1000 * 60 * 60 * 3
            : (nextItem as (typeof items)[0]).start_time,
        canMove: false,
        canResize: "both",
        description: "",
        bgColor: randomColor({
          luminosity: "light",
          seed: Math.floor(Math.random() * 1000),
          format: "rgba",
          alpha: 1,
        }),
      } as (typeof items)[0];

      setItems((items) => items.concat([newItem]));
      setSelectedItem(newItem);
    },
    [items]
  );

  const goToPrevDay = useCallback(() => {
    const zoom = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(visibleTimeStart - zoom);
    setVisibleTimeEnd(visibleTimeEnd - zoom);
  }, [visibleTimeEnd, visibleTimeStart]);

  const goToNextDay = useCallback(() => {
    const zoom = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(visibleTimeStart + zoom);
    setVisibleTimeEnd(visibleTimeEnd + zoom);
  }, [visibleTimeEnd, visibleTimeStart]);

  const itemRenderer = useCallback<
    NonNullable<ComponentProps<typeof Timeline>["itemRenderer"]>
  >((props) => <TimelineItem {...props} />, []);

  const groupRenderer = useCallback<
    NonNullable<ComponentProps<typeof Timeline>["groupRenderer"]>
  >((props) => <GroupItem {...props} />, []);

  const renderTimeline = useCallback(
    (value: {
      visibleTimeStart: SpringValue<number>;
      visibleTimeEnd: SpringValue<number>;
    }) => (
      <AnimatedTimeline
        groups={groups}
        items={items}
        selected={selected}
        keys={keys}
        useResizeHandle
        moveResizeValidator={moveResizeValidator}
        onItemResize={onItemResize}
        sidebarWidth={200}
        lineHeight={80}
        canMove={false}
        canResize="both"
        itemTouchSendsClick={false}
        stackItems={false}
        itemHeightRatio={0.85}
        itemRenderer={itemRenderer}
        onCanvasClick={onCanvasClick}
        timeSteps={timeSteps}
        buffer={1}
        onTimeChange={noop}
        groupRenderer={groupRenderer}
        {...value}
      >
        <TimelineHeaders>
          <SidebarHeader>
            {({ getRootProps }) => {
              return (
                <div
                  {...getRootProps()}
                  className="border-r-[1px] border-b-[1px] border-solid border-[#1b1f20]"
                />
              );
            }}
          </SidebarHeader>
          <DateHeader unit="hour" height={60} labelFormat="hh a" />
        </TimelineHeaders>
        <TimelineMarkers>
          <TodayMarker date={Date.now()}>
            {({ styles: { backgroundColor, width, ...styles } }) => (
              <div style={styles} className="z-[999] w-[1px] bg-[#0465ff]">
                <svg className="-translate-x-1/2 absolute top-0 left-1/2 w-[20px] h-[20px]">
                  <path
                    d="M 0 0 L 20 0 L 10 10 L 0 0"
                    className="fill-[#0465ff] stroke-none"
                  />
                </svg>
              </div>
            )}
          </TodayMarker>
        </TimelineMarkers>
      </AnimatedTimeline>
    ),
    [
      groupRenderer,
      groups,
      itemRenderer,
      items,
      moveResizeValidator,
      onCanvasClick,
      onItemResize,
      selected,
    ]
  );

  const springTransitionValue = useMemo(
    () => ({ visibleTimeStart, visibleTimeEnd }),
    [visibleTimeStart, visibleTimeEnd]
  );

  const timelineContextValue = useMemo(
    () => ({
      setSelectedItem,
      selectedItem,
      removeItem,
      updateItem,
    }),
    [removeItem, selectedItem, updateItem]
  );

  return (
    <TimelineContext.Provider value={timelineContextValue}>
      <main className="flex flex-col bg-[#121314]">
        <div className="flex flex-col justify-center h-[100px] px-[32px] border-b-[1px] border-solid border-[#1b1f20]">
          <div className="flex flex-col gap-[4px]">
            <div className="flex flex-row gap-[4px] text-[14px] leading-[1.14]">
              <div className="text-[#787c84]">{"Home"}</div>
              <div className="text-[#787c84]">{"/"}</div>
              <div className="text-[#787c84]">{"CompanyName"}</div>
              <div className="text-[#787c84]">{"/"}</div>
              <div className="font-semibold text-[#777c83]">
                {"Dispatch Center"}
              </div>
            </div>
            <h1 className="text-[28px] leading-[1.14] font-bold text-[#fff]">
              {"Dispatch Center"}
            </h1>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center h-[60px] px-[32px] border-b-[1px] border-solid border-[#1b1f20]">
          <div className="relative">
            <div className="translate-x-[10px] -translate-y-1/2 absolute top-1/2 text-[#fff]">
              <ion-icon name="search-outline" />
            </div>
            <input
              type="text"
              placeholder="search"
              className="h-[40px] p-0 pr-[20px] pl-[35px] border-0 text-[14px] bg-transparent text-[#fff]"
            />
          </div>
          <div className="flex flex-row items-center gap-[64px]">
            <div className="flex flex-row items-center gap-[32px]">
              <div className="cursor-pointer flex flex-row items-center gap-[8px] text-[#787c84]">
                <ion-icon name="funnel-outline" />
                <div className="text-[14px] text-[#787c84]">{"Filter"}</div>
              </div>
              <div className="cursor-pointer flex flex-row items-center gap-[8px] text-[#787c84]">
                <ion-icon name="options-outline" />
                <div className="text-[14px] text-[#787c84]">{"Sort"}</div>
              </div>
            </div>
            <div className="cursor-pointer flex flex-row items-center gap-[8px] h-[36px] px-[8px] border-[1px] border-solid border-[#1b1f20] rounded-[8px] text-[#787c84]">
              <div
                className="flex flex-row justify-center items-center"
                role="button"
                onClick={goToPrevDay}
              >
                <ion-icon name="chevron-back-outline" />
              </div>
              <div className="text-[14px] text-[#fff]">
                {moment(visibleTimeStart).format("MMM DD, YYYY")}
              </div>
              <div
                className="flex flex-row justify-center items-center"
                role="button"
                onClick={goToNextDay}
              >
                <ion-icon name="chevron-forward-outline" />
              </div>
            </div>
          </div>
        </div>
        <Spring to={springTransitionValue}>{renderTimeline}</Spring>
        <EditEntryForm />
      </main>
    </TimelineContext.Provider>
  );
};

export default App;
