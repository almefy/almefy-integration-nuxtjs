<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in itemsByRole"
          :key="i"
          :to="item.to"
          router
          exact
          @click.prevent="item.click"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light> mdi-repeat </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          isAdmin: false,
          to: '#',
          click: e => {
            this.$router.push('/')
          }
        },
        {
          icon: 'mdi-apps',
          title: 'User-Management',
          isAdmin: true,
          to: '#',
          click: e => {
            this.$router.push('/user-management')
          }
        },
        {
          icon: 'mdi-logout',
          title: 'Logout',
          isAdmin: false,
          click: this.handleLogout,
          to: '#'
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Sample on nuxt.js',
    }
  },
  computed: {
    itemsByRole () {
      // console.log(this.$store.getters.userRole);
      if (this.$store.getters.userRole === "ROLE_ADMIN")
        return this.items;
      else
        return this.items.filter(i => i.isAdmin === false);
    }
  },
  methods: {
    async handleLogout() {
      await this.$store.dispatch("logout", this);
      this.$router.push(this.$config.loginRoute);
    }

  }
}
</script>
