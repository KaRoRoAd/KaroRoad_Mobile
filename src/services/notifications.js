import notifee, {TriggerType, AndroidImportance} from '@notifee/react-native';

export const scheduleNotification = async (title, body, date) => {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  // Calculate notification time (10 minutes before the event)
  const notificationTime = new Date(date);
  notificationTime.setMinutes(notificationTime.getMinutes() - 10);

  // Don't schedule if the time is in the past
  if (notificationTime <= new Date()) {
    return;
  }

  // Create a time-based trigger
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: notificationTime.getTime(),
  };

  // Create the notification
  await notifee.createTriggerNotification(
    {
      title,
      body,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
    },
    trigger,
  );
};

export const cancelAllNotifications = async () => {
  await notifee.cancelAllNotifications();
};

export const scheduleTaskNotification = async (task) => {
  await scheduleNotification(
    'Przypomnienie o zadaniu',
    `Zadanie "${task.name}" rozpocznie się za 10 minut`,
    task.deadLine,
  );
};

export const scheduleMeetingNotification = async (meeting) => {
  await scheduleNotification(
    'Przypomnienie o spotkaniu',
    `Spotkanie "${meeting.name}" rozpocznie się za 10 minut`,
    meeting.startDate,
  );
}; 