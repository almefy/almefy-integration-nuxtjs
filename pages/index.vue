<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card class="logo py-4 d-flex justify-center">
        <Logo />
      </v-card>
      <v-card>
        <v-card-title class="headline">
          Welcome to Sample with nuxt.js
        </v-card-title>
        <v-card-text>
          <p>
            If you see this page, everything works (JWT almefy_access_token is set and verified).
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
