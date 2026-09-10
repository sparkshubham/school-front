export const PAGE_SIZE = 20;

export function decodeAccessToken(token) {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    const padded = part.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(padded);
    const json = decodeURIComponent(
      [...bin].map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
    );
    const payload = JSON.parse(json);
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function userFromPayload(payload) {
  if (!payload?.sub || !payload.role) return null;
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId || null,
    linkedStudentId: payload.linkedStudentId || null,
    linkedParentId: payload.linkedParentId || null,
    linkedTeacherId: payload.linkedTeacherId || null,
  };
}

export function schoolFromPayload(payload, cached) {
  if (cached?.name) return cached;
  if (!payload?.schoolName && !payload?.tenantId) return cached || null;
  return {
    name: payload.schoolName || cached?.name,
    plan: payload.plan || cached?.plan,
    status: payload.tenantStatus || cached?.status,
    logo: payload.schoolLogo || cached?.logo,
    city: payload.schoolCity || cached?.city,
    modules: payload.modules || cached?.modules,
  };
}

export function readCachedSchool() {
  try {
    return JSON.parse(localStorage.getItem('edunest_school') || 'null');
  } catch {
    return null;
  }
}

export function persistSchool(school) {
  if (school) localStorage.setItem('edunest_school', JSON.stringify(school));
  else localStorage.removeItem('edunest_school');
}
