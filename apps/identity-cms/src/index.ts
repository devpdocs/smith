import type { Core } from '@strapi/strapi';

/**
 * End-user roles for the MVP (Q3). These are distinct from Strapi Panel
 * super-admins. `admin` is assigned only via the seed (I1), never by
 * registration (which always creates a `user`-role account).
 */
const END_USER_ROLES = ['user', 'admin'] as const;

export default {
  /**
   * Ensures the `user` and `admin` end-user roles exist and configures the
   * users-permissions plugin so registration creates a `user`-role account
   * by default (D1; Q3; AC4-AC7).
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });
    const advanced = ((await pluginStore.get({ key: 'advanced' })) ?? {}) as {
      default_role?: string;
    };

    // Copy permissions from the plugin's default `authenticated` role when it
    // exists, so the new end-user roles can at least access the same surface.
    const authenticated = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    for (const type of END_USER_ROLES) {
      const existing = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type } });
      if (existing) {
        continue;
      }

      const role = await strapi.db
        .query('plugin::users-permissions.role')
        .create({
          data: {
            name: type,
            type,
            description: `End-user role: ${type}`,
          },
        });

      if (authenticated) {
        const permissions = await strapi.db
          .query('plugin::users-permissions.permission')
          .findMany({ where: { role: authenticated.id } });
        for (const permission of permissions) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: permission.action,
              role: role.id,
            },
          });
        }
      }
    }

    // Registration always assigns the `user` role (D1; AC4-AC7).
    if (advanced.default_role !== 'user') {
      await pluginStore.set({
        key: 'advanced',
        value: { ...advanced, default_role: 'user' },
      });
    }
  },
};
