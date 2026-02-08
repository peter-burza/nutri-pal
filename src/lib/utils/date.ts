import { format } from "date-fns"

export const getTodayDateString = () => {
  return format(new Date(), "yyyy-MM-dd")
}

export const formatDisplayDate = (dateString: string) => {
  return format(new Date(dateString), "EEEE, MMM d")
}
