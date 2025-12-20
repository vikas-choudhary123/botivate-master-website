import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_USER_URL}/attendence`;

export const fetchAttendanceSummaryApi = async (
    fromDate,
    toDate
) => {
    try {
        const params = {};

        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const res = await axios.get(BASE_URL, { params });

        return { data: res.data };
    } catch (err) {
        return {
            error:
                err.response?.data?.message ||
                "Failed to fetch attendance data",
        };
    }
};
