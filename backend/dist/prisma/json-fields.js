"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_FIELDS = void 0;
exports.toJsonString = toJsonString;
exports.parseJsonFields = parseJsonFields;
exports.JSON_FIELDS = {
    RoomType: ['amenities', 'imageUrls'],
    Room: ['features'],
    Guest: ['tags'],
    GuestPreference: ['dietaryRestrictions', 'spokenLanguages'],
    HousekeepingTask: ['photoUrls'],
    MaintenanceTicket: ['photoUrls'],
    AIAlert: ['metadata'],
    AuditLog: ['beforeState', 'afterState'],
};
function toJsonString(value) {
    if (value === undefined)
        return undefined;
    if (value === null)
        return undefined;
    if (typeof value === 'string')
        return value;
    return JSON.stringify(value);
}
function parseField(raw) {
    if (typeof raw !== 'string' || raw.length === 0)
        return raw;
    try {
        return JSON.parse(raw);
    }
    catch {
        return raw;
    }
}
function parseRow(model, row) {
    const fields = exports.JSON_FIELDS[model];
    if (!fields || row == null || typeof row !== 'object')
        return;
    for (const f of fields) {
        if (f in row)
            row[f] = parseField(row[f]);
    }
}
function parseJsonFields(model, result) {
    if (!model || !exports.JSON_FIELDS[model] || result == null)
        return result;
    if (Array.isArray(result)) {
        for (const row of result)
            parseRow(model, row);
    }
    else if (typeof result === 'object') {
        parseRow(model, result);
    }
    return result;
}
//# sourceMappingURL=json-fields.js.map