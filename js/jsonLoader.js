export async function getJson(path) {
    const response = await fetch(path);
    return await response.json();
};