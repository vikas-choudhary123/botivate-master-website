const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/settings`;

export const fetchUserDetailsApi = async () => {
    try {
        const response = await fetch(`${BASE_URL}/users`);
        return await response.json();
    } catch (error) {
        console.log("Error fetching users", error);
        return [];
    }
};


export const deleteUserByIdApi = async (id) => {
    try {
        await fetch(`${BASE_URL}/users/${id}`, {
            method: "DELETE",
        });
    } catch (error) {
        console.log("Error deleting user", error);
    }
};

export const updateUserDataApi = async ({ id, updatedUser }) => {
    try {
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser),
        });

        return await response.json();
    } catch (error) {
        console.log("Error updating user", error);
        return null;
    }
};

/**
 * PATCH system_access (append, no overwrite)
 * @param {number} id
 * @param {string[] | string} system_access
 */
export const patchSystemAccessApi = async ({ id, system_access }) => {
    try {
        const response = await fetch(
            `${BASE_URL}/users/${id}/system_access`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ system_access }),
            }
        );

        return await response.json();

    } catch (error) {
        console.log("Error patching system_access", error);
        return null;
    }
};