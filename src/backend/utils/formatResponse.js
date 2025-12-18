export const formatResponse = (data) => {
    if (!data) {
        return {
            success: false,
            message: 'No data available',
        };
    }

    return {
        success: true,
        data: data,
    };
};