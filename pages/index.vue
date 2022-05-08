<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card class="logo py-4 d-flex justify-center">
        <AlmefyLogo />
      </v-card>
      <v-card>
        <v-card-title class="headline">
          Welcome to Almefy on Nuxt.js
        </v-card-title>
        <v-card-text>
          <p>
            If you see this page, everything works. Happy coding!
          </p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Default',
}
</script>
