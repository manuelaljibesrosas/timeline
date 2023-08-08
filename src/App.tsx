/* @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import moment from "moment";
import randomColor from "randomcolor";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TimelineItem,
  TimelineMarkers,
  TodayMarker,
  Id,
} from "react-calendar-timeline";
import { easings, interpolate, run, sequence, unit } from "tween-fn";
import generateFakeData from "./generate-fake-data";
import { Spring, animated } from "react-spring";

const AnimatedTimeline = animated((props: ComponentProps<typeof Timeline>) => (
  <Timeline {...props} />
));

const Button = styled.div`
  cursor: pointer;
  height: 35px;
  padding: 0 16px;
  font-size: 10px;
  text-transform: uppercase;
  line-height: 35px;
  border-radius: 8px;
  background-color: #000;
  color: #fff;
`;

const Text = styled.div`
  font-size: 14px;
  color: #787c84;
`;

const convertTimestampToDatetimeLocalString = (t: number) => {
  const date = new Date(t);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = "00";

  // Combine date-time components
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const datetimeLocalToTimestamp = (formattedDate: string) => {
  const [datePart, timePart] = formattedDate.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Note: The month in the Date constructor is 0-indexed.
  const dateObj = new Date(year, month - 1, day, hour, minute);

  return dateObj.getTime();
};

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

const defaultTimeStart = moment().startOf("day").toDate().valueOf();
const defaultTimeEnd = moment().startOf("day").add(1, "day").toDate().valueOf();

const App: React.FC = () => {
  const entryForm = useRef<HTMLDivElement | null>(null);
  const entryFormBackdrop = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<
    ReturnType<typeof generateFakeData>["items"]
  >([]);
  const [groups, setGroups] = useState<
    ReturnType<typeof generateFakeData>["groups"]
  >([]);
  const [selectedItem, setSelectedItem] = useState<
    ReturnType<typeof generateFakeData>["items"][0] | null
  >(null);
  const [selectedItemTitle, setSelectedItemTitle] = useState("");
  const [selectedItemLocation, setSelectedItemLocation] = useState("");
  const [selectedItemStartDate, setSelectedItemStartDate] = useState(-1);
  const [selectedItemEndDate, setSelectedItemEndDate] = useState(-1);
  const [selectedItemDescription, setSelectedItemDescription] = useState("");
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

  useEffect(() => {
    if (selectedItem === null) return;
    setSelectedItemTitle(selectedItem.title as string);
    setSelectedItemLocation(
      (selectedItem as ReturnType<typeof generateFakeData>["items"][0]).location
    );
    setSelectedItemStartDate(selectedItem.start_time);
    setSelectedItemEndDate(selectedItem.end_time);
    setSelectedItemDescription(
      (selectedItem as ReturnType<typeof generateFakeData>["items"][0])
        .description
    );
  }, [selectedItem]);

  const removeItem = useCallback((id: TimelineItem<{}>["id"]) => {
    setItems((items) => {
      const index = items.findIndex((item) => id === item.id);
      const updatedItemsList = items.slice();
      updatedItemsList.splice(index, 1);
      return updatedItemsList;
    });
  }, []);

  const entryFormIntro = useCallback(() => {
    const seq = sequence([
      unit({
        duration: 160,
        ease: easings.SQUARED,
        change: (y) => {
          const entryFormNode = entryForm.current as HTMLDivElement;
          const backdropNode = entryFormBackdrop.current as HTMLDivElement;

          Object.assign(entryFormNode.style, {
            opacity: `${interpolate(y, 0, 1)}`,
            transform: `translate(-50%, calc(-50% + ${interpolate(
              y,
              10,
              0
            )}px))`,
          });
          Object.assign(backdropNode.style, {
            opacity: `${interpolate(y, 0.5, 1)}`,
          });
        },
      }),
    ]);

    run(seq);
  }, []);

  const entryFormOutro = useCallback(() => {
    const seq = sequence([
      unit({
        duration: 160,
        ease: easings.SQUARED,
        change: (y) => {
          const entryFormNode = entryForm.current as HTMLDivElement;
          const backdropNode = entryFormBackdrop.current as HTMLDivElement;

          Object.assign(entryFormNode.style, {
            opacity: `${interpolate(y, 1, 0)}`,
            transform: `translate(-50%, -50%) scale(${interpolate(y, 1, 0.9)})`,
          });
          Object.assign(backdropNode.style, {
            opacity: `${interpolate(y, 1, 0)}`,
          });
        },
        complete: () => {
          setSelectedItem(null);
        },
      }),
    ]);

    run(seq);
  }, []);

  const itemRenderer = useCallback<
    NonNullable<React.ComponentProps<typeof Timeline>["itemRenderer"]>
  >(
    ({ item, itemContext, getItemProps, getResizeProps }) => {
      const {
        style: { top, left, width, height },
        ...props
      } = getItemProps(item);
      const { left: leftResizeProps, right: rightResizeProps } =
        getResizeProps();

      return (
        <div
          {...props}
          style={{
            top,
            left: `calc(${left} + 4px)`,
            width: `calc(${width} - 8px)`,
            height,
          }}
          css={css`
            position: absolute;
            z-index: 82;
            overflow: hidden;
            display: flex;
            justify-content: space-between;
            padding: 0 16px;
            border-radius: 6px;
            background-color: #222325;

            &:hover .timeline-entry__controls {
              ${!itemContext.resizing &&
              `
              pointer-events: all;
              top: 0;
              opacity: 1;`}
            }
            &:hover .rct-item-handler {
              opacity: 1;
            }
          `}
        >
          <div
            className="timeline-entry__controls"
            css={css`
              pointer-events: none;
              transition: all 120ms ease;
              position: absolute;
              top: 100%;
              left: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              opacity: 0;
              background-color: rgba(0, 0, 0, 0.4);
            `}
          >
            <div
              css={css`
                display: flex;
                gap: 8px;
              `}
            >
              <div
                onClick={() => {
                  setSelectedItem(item as typeof selectedItem);
                  entryFormIntro();
                }}
                css={css`
                  cursor: pointer;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width: 35px;
                  height: 35px;
                  border-radius: 50%;
                  background-color: #1b1f20;
                  color: #fff;
                `}
              >
                <ion-icon name="create-outline" />
              </div>
              <div
                onClick={() => {
                  removeItem(item.id);
                }}
                css={css`
                  cursor: pointer;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width: 35px;
                  height: 35px;
                  border-radius: 50%;
                  background-color: #1b1f20;
                  color: #fff;
                `}
              >
                <ion-icon name="trash-outline" />
              </div>
            </div>
          </div>
          {itemContext.useResizeHandle && leftResizeProps !== undefined && (
            <div
              ref={leftResizeProps.ref}
              className={leftResizeProps.className}
              css={css`
                cursor: ${itemContext.resizing ? "grabbing" : "grab"};
                transition: opacity 120ms ease;
                z-index: 88;
                position: absolute;
                left: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 15px;
                height: 100%;
                opacity: ${itemContext.resizing ? "1" : "0"};
                background-color: #333;
              `}
            >
              <span
                css={css`
                  pointer-events: none;
                  color: #787c84;
                `}
              >
                <ion-icon name="pause-outline" />
              </span>
            </div>
          )}
          {itemContext.useResizeHandle && rightResizeProps !== undefined && (
            <div
              ref={rightResizeProps.ref}
              className={rightResizeProps.className}
              css={css`
                cursor: ${itemContext.resizing ? "grabbing" : "grab"};
                transition: opacity 120ms ease;
                z-index: 88;
                position: absolute;
                right: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 15px;
                height: 100%;
                opacity: ${itemContext.resizing ? "1" : "0"};
                background-color: #333;
                color: #787c84;
              `}
            >
              <span
                css={css`
                  pointer-events: none;
                  color: #787c84;
                `}
              >
                <ion-icon name="pause-outline" />
              </span>
            </div>
          )}
          <div
            css={css`
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 6px;
            `}
          >
            <div
              title={item.title as string}
              style={{
                maxHeight: itemContext.dimensions.height,
              }}
              css={css`
                user-select: none;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                font-size: 16px;
                font-weight: 600;
                color: #fff;
              `}
            >
              {item.title}
            </div>
            <Text
              css={css`
                user-select: none;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                font-size: 12px;
              `}
            >
              {(item as TimelineItem<{ location: string }>).location}
            </Text>
          </div>
        </div>
      );
    },
    [entryFormIntro, removeItem]
  );

  return (
    <main
      css={css`
        display: flex;
        flex-direction: column;
        background-color: #121314;
      `}
    >
      <div
        css={css`
          height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 32px;
          border-bottom: 1px solid #1b1f20;
        `}
      >
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 4px;
          `}
        >
          <div
            css={css`
              display: flex;
              gap: 4px;
              font-size: 12px;
            `}
          >
            <Text>{"Home"}</Text>
            <Text>{"/"}</Text>
            <Text>{"CompanyName"}</Text>
            <Text>{"/"}</Text>
            <Text
              css={css`
                font-weight: 600;
                color: #777c83;
              `}
            >
              {"Dispatch Center"}
            </Text>
          </div>
          <h1
            css={css`
              font-size: 28px;
              color: #fff;
            `}
          >
            {"Dispatch Center"}
          </h1>
        </div>
      </div>
      <div
        css={css`
          height: 60px;
          padding: 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1b1f20;
        `}
      >
        <div
          css={css`
            position: relative;
          `}
        >
          <div
            css={css`
              position: absolute;
              color: white;
              top: 50%;
              transform: translate(10px, -50%);
            `}
          >
            <ion-icon name="search-outline" />
          </div>
          <input
            type="text"
            placeholder="search"
            css={css`
              background-color: transparent;
              border: none;
              padding: 0 20px 0 35px;
              height: 40px;
              color: #fff;
              font-size: 14px;
            `}
          />
        </div>
        <div
          css={css`
            display: flex;
            gap: 64px;
            align-items: center;
          `}
        >
          <div
            css={css`
              display: flex;
              gap: 32px;
              align-items: center;
            `}
          >
            <div
              css={css`
                cursor: pointer;
                display: flex;
                gap: 8px;
                align-items: center;
                color: #787c84;
              `}
            >
              <ion-icon name="funnel-outline" />
              <Text
                css={css`
                  font-size: 14px;
                `}
              >
                {"Filter"}
              </Text>
            </div>
            <div
              css={css`
                cursor: pointer;
                display: flex;
                gap: 8px;
                align-items: center;
                color: #787c84;
              `}
            >
              <ion-icon name="options-outline" />
              <Text
                css={css`
                  font-size: 14px;
                `}
              >
                {"Sort"}
              </Text>
            </div>
          </div>
          <div
            css={css`
              cursor: pointer;
              display: flex;
              gap: 8px;
              align-items: center;
              height: 36px;
              padding: 0 8px;
              border: 1px solid #1b1f20;
              border-radius: 8px;
              color: #787c84;
            `}
          >
            <div
              role="button"
              onClick={() => {
                const zoom = visibleTimeEnd - visibleTimeStart;
                setVisibleTimeStart(visibleTimeStart - zoom);
                setVisibleTimeEnd(visibleTimeEnd - zoom);
              }}
              css={css`
                display: flex;
                justify-content: center;
                align-items: center;
              `}
            >
              <ion-icon name="chevron-back-outline" />
            </div>
            <Text
              css={css`
                color: #fff;
              `}
            >
              {moment(visibleTimeStart).format("MMM DD, YYYY")}
            </Text>
            <div
              role="button"
              onClick={() => {
                const zoom = visibleTimeEnd - visibleTimeStart;
                setVisibleTimeStart(visibleTimeStart + zoom);
                setVisibleTimeEnd(visibleTimeEnd + zoom);
              }}
              css={css`
                display: flex;
                justify-content: center;
                align-items: center;
              `}
            >
              <ion-icon name="chevron-forward-outline" />
            </div>
          </div>
        </div>
      </div>
      <Spring to={{ visibleTimeStart, visibleTimeEnd }}>
        {(value: any) => (
          <AnimatedTimeline
            groups={groups}
            items={items}
            selected={selected}
            keys={keys}
            useResizeHandle
            moveResizeValidator={(action, item, time, edge) => {
              if (action === "move") return;

              const index = items.findIndex(
                ({ id }) => id === (item as any).id
              );
              if (index === -1) return time;
              const selectedItem = items[index];
              const itemsInGroup = items.filter(
                ({ group }) => group === selectedItem.group
              );
              let previousItem: typeof items[0] | null | any = null;
              let nextItem: typeof items[0] | null | any = null;

              itemsInGroup.forEach((item) => {
                if (
                  item.end_time < selectedItem.start_time &&
                  (previousItem === null ||
                    previousItem.end_time < item.end_time)
                )
                  previousItem = item;
                if (
                  item.start_time > selectedItem.end_time &&
                  (nextItem === null || nextItem.start_time > item.start_time)
                )
                  nextItem = item;
              });

              if (edge === "right")
                return nextItem === null
                  ? time
                  : Math.min(nextItem.start_time, time);
              else
                return previousItem === null
                  ? time
                  : Math.max(previousItem.end_time, time);
            }}
            onItemResize={(itemId, time, edge) =>
              setItems((items) => {
                const index = items.findIndex((item) => item.id === itemId);
                const selectedItem = items[index];
                const itemsInGroup = items.filter(
                  ({ group }) => group === selectedItem.group
                );
                let previousItem: typeof items[0] | null | any = null;
                let nextItem: typeof items[0] | null | any = null;

                itemsInGroup.forEach((item) => {
                  if (
                    item.end_time < selectedItem.start_time &&
                    (previousItem === null ||
                      previousItem.end_time < item.end_time)
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
              })
            }
            sidebarWidth={200}
            lineHeight={80}
            canMove={false}
            canResize="both"
            itemTouchSendsClick={false}
            stackItems={false}
            itemHeightRatio={0.85}
            itemRenderer={itemRenderer}
            {...value}
            onCanvasClick={(groupId, time) => {
              const itemsInGroup = items.filter(
                ({ group }) => group === groupId
              );
              let previousItem: typeof items[0] | null = null;
              let nextItem: typeof items[0] | null = null;

              itemsInGroup.forEach((item) => {
                if (
                  item.end_time < time &&
                  (previousItem === null ||
                    previousItem.end_time < item.end_time)
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
                  (nextItem as typeof items[0]).start_time >
                    time + 1000 * 60 * 60 * 3
                    ? time + 1000 * 60 * 60 * 3
                    : (nextItem as typeof items[0]).start_time,
                start: time,
                end:
                  nextItem === null ||
                  (nextItem as typeof items[0]).start_time >
                    time + 1000 * 60 * 60 * 3
                    ? time + 1000 * 60 * 60 * 3
                    : (nextItem as typeof items[0]).start_time,
                canMove: false,
                canResize: "both",
                description: "",
                bgColor: randomColor({
                  luminosity: "light",
                  seed: Math.floor(Math.random() * 1000),
                  format: "rgba",
                  alpha: 1,
                }),
              } as typeof items[0];

              setItems((items) => items.concat([newItem]));
              setSelectedItem(newItem);
              entryFormIntro();
            }}
            timeSteps={{
              second: 1,
              minute: 1,
              hour: 3,
              day: 1,
              month: 1,
              year: 1,
            }}
            buffer={1}
            onTimeChange={() => {}}
            groupRenderer={({ group }) => {
              return (
                <div
                  css={css`
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 15px;
                    width: 100%;
                    height: calc(100% - 16px);
                    font-size: 14px;
                    line-height: 1;
                    border-radius: 6px;
                    background-color: #222325;
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      align-items: center;
                      gap: 8px;
                    `}
                  >
                    <img
                      src={`http://randomuser.me/api/portraits/women/${Math.round(
                        Math.random() * 100
                      )}.jpg`}
                      alt="profile"
                      css={css`
                        width: 22px;
                        height: 22px;
                        border-radius: 50%;
                      `}
                    />
                    <div
                      css={css`
                        color: #fff;
                      `}
                    >
                      {group.title}
                    </div>
                  </div>
                  <span
                    css={css`
                      font-size: 16px;
                      color: #787c84;
                    `}
                  >
                    <ion-icon name="ellipsis-vertical" />
                  </span>
                </div>
              );
            }}
          >
            <TimelineHeaders>
              <SidebarHeader>
                {({ getRootProps }) => {
                  return (
                    <div
                      {...getRootProps()}
                      css={css`
                        border-right: 1px solid #1b1f20;
                        border-bottom: 1px solid #1b1f20;
                      `}
                    />
                  );
                }}
              </SidebarHeader>
              <DateHeader unit="hour" height={60} labelFormat="hh a" />
            </TimelineHeaders>
            <TimelineMarkers>
              <TodayMarker date={Date.now()}>
                {({ styles: { backgroundColor, width, ...styles } }) => (
                  <div
                    style={styles}
                    css={css`
                      z-index: 999;
                      width: 1px;
                      background-color: #0465ff;
                    `}
                  >
                    <svg
                      css={css`
                        transform: translateX(-50%);
                        top: 0;
                        left: 50%;
                        position: absolute;
                        width: 20px;
                        height: 20px;
                      `}
                    >
                      <path
                        d="M 0 0 L 20 0 L 10 10 L 0 0"
                        css={css`
                          fill: #0465ff;
                          stroke: none;
                        `}
                      />
                    </svg>
                  </div>
                )}
              </TodayMarker>
            </TimelineMarkers>
          </AnimatedTimeline>
        )}
      </Spring>
      {selectedItem !== null && (
        <div
          ref={entryFormBackdrop}
          onClick={() => {
            entryFormOutro();
          }}
          css={css`
            z-index: 9999;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.5);
          `}
        >
          <div
            ref={entryForm}
            onClick={(e) => e.stopPropagation()}
            css={css`
              transform: translate(-50%, -50%);
              position: fixed;
              top: 50%;
              left: 50%;
              display: flex;
              flex-direction: column;
              gap: 32px;
              max-width: calc(100% - 30px);
              width: 400px;
              padding: 16px;
              border-radius: 8px;
              background-color: #222325;
            `}
          >
            <div
              css={css`
                display: flex;
                flex-direction: column;
                gap: 16px;
              `}
            >
              <input
                type="text"
                placeholder="title"
                value={selectedItemTitle}
                onChange={(e) => setSelectedItemTitle(e.target.value)}
                css={css`
                  border: none;
                  background-color: transparent;
                  color: #fff;
                  font-size: 32px;
                  font-weight: 600;
                `}
              />
              <input
                type="text"
                placeholder="location"
                value={selectedItemLocation}
                onChange={(e) => setSelectedItemLocation(e.target.value)}
                css={css`
                  border: none;
                  background-color: transparent;
                  color: #fff;
                `}
              />
              <div
                css={css`
                  display: flex;
                  gap: 4px;
                `}
              >
                <input
                  type="datetime-local"
                  placeholder="start date"
                  value={convertTimestampToDatetimeLocalString(
                    selectedItemStartDate
                  )}
                  onChange={(e) => {
                    setSelectedItemStartDate(
                      datetimeLocalToTimestamp(e.target.value)
                    );
                  }}
                  max={convertTimestampToDatetimeLocalString(
                    selectedItemEndDate
                  )}
                  css={css`
                    border: none;
                    background-color: transparent;
                    color: #fff;
                  `}
                />
                <input
                  type="datetime-local"
                  placeholder="end date"
                  value={convertTimestampToDatetimeLocalString(
                    selectedItemEndDate
                  )}
                  onChange={(e) => {
                    setSelectedItemEndDate(
                      datetimeLocalToTimestamp(e.target.value)
                    );
                  }}
                  css={css`
                    border: none;
                    background-color: transparent;
                    color: #fff;
                  `}
                />
              </div>
              <textarea
                placeholder="description"
                value={selectedItemDescription}
                onChange={(e) => setSelectedItemDescription(e.target.value)}
                css={css`
                  min-width: 100%;
                  max-width: 100%;
                  border: none;
                  background-color: transparent;
                  color: #fff;
                `}
              />
            </div>
            <div
              css={css`
                display: flex;
                justify-content: space-between;
              `}
            >
              <Button
                role="button"
                onClick={() => {
                  entryFormOutro();
                }}
              >
                {"Cancel"}
              </Button>
              <Button
                role="button"
                onClick={() => {
                  updateItem({
                    ...selectedItem,
                    title: selectedItemTitle,
                    location: selectedItemLocation,
                    start_time: selectedItemStartDate,
                    start: selectedItemStartDate,
                    end_time: selectedItemEndDate,
                    end: selectedItemEndDate,
                    description: selectedItemDescription,
                  });
                  setSelectedItem(null);
                }}
              >
                {"Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default App;
