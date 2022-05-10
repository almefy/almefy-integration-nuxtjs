<template>

  <v-app dark>

    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="6" md="6">
          <v-card elevation="24">
            <v-row no-gutters>
              <v-col cols="12" md="8" class="black--text">
                <v-card-title class="text-h3"><Logo/></v-card-title>
                <v-card-subtitle class="text-h6">Sample Login on nuxt.js</v-card-subtitle>
                <v-card-text><small>Version 1.0</small></v-card-text>
              </v-col>
              <v-col cols="12" md="4">
                <v-container style="text-align:center; vertical-align:middle">
                  <div v-show="!hideAll" >
                  <div v-show="challenge.id==null">Initialising</div>
                  <img v-show="challenge.authImages!=null" :src="challenge.authImages['qrcode-standard']" style="width:120px" />
                  </div>
                </v-container>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>

</template>

<script>

  export default {
    layout: 'default',
    data: () => ({
      hideAll: false,
      challenge: {
        id: null,
        authImages: { 'qrcode-extended': null,  'qrcode-standard': null},
        authTokenUrl: null,
        authType: null,
        pollingUrl: null,
        socketsUrl: null,
        expiresAt: null
      }
    }),
    mounted() {

      const data = {"key": this.$config.accessKey}
      this.$axios.$post(`${this.$config.apiHost}/v1/entity/challenges`, data).then((response) => {
        this.challenge = response;
        this.checkChallenge(response.id);
      });

    },
    methods: {

      checkChallenge(challengeId) {
        this.$axios.get(this.challenge.pollingUrl).then((response) => {
          if (response.status===204) {
            this.checkChallenge(challengeId);
          } else if (response.status===200)  {
            this.$axios.get(this.challenge.authTokenUrl).then(response => {
              this.$axios.get(`${this.$config.authControllerUrl}`, {
                headers: { 'X-Sample-Auth': response.data.token }
              }).then(response => {
                  if (response.status===200) {
                    console.log('Got the roundtrip completly, got own JWT token based on secret with identity via Roundtrip.');
                    this.$router.push(this.$config.homeRoute);
                  }
              })
            })
          } else {
            // this should die cause of....
          }
        });

      }
    }
  };
</script>
<style scoped lang="css">
</style>




