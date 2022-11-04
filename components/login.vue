<template>

  <v-app dark>

    <v-container fluid class="fill-height">
      <v-row v-show="showLogin" justify="center">
        <v-col cols="12" sm="6" md="6">
          <v-card elevation="24">
            <v-row no-gutters>
              <v-col cols="12" md="8" class="black--text">
                <v-card-title class="text-h3"><Logo/></v-card-title>
                <v-card-subtitle class="text-h6">Sample Login on nuxt.js</v-card-subtitle>
                <v-card-text><small>Version 1.0a</small>
                <v-card-text><v-btn v-show="publicEnrollment" @click="showLogin = !showLogin">Enroll new user here</v-btn></v-card-text>
                </v-card-text>

              </v-col>

              <v-col cols="12" md="4">
                <v-container style="text-align:center; padding-top:30px;padding-right:50px;">
                  <div v-show="!hideAll" >
                  <div v-show="challenge.id==null">Initialising</div>
                  <div v-show="challenge.id!=null">Scan QR-Code</div>
                  <img v-show="challenge.authImages!=null" :src="challenge.authImages['qrcode-standard']" style="width:120px" />
                  </div>
                </v-container>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-show="!showLogin" justify="center">
        <v-col cols="12" sm="6" md="6">
          <v-card elevation="24">
            <v-row no-gutters>
              <v-col cols="12" md="8" class="black--text">
                <v-card-title class="text-h3"><Logo/></v-card-title>
                <v-card-subtitle class="text-h6">Enroll a new user</v-card-subtitle>
                <v-card-text><small>Version 1.0a</small></v-card-text>
                <v-card-text><v-btn @click="showLogin = !showLogin">Back to login</v-btn></v-card-text>
              </v-col>
              <v-col cols="12" md="4">
                <v-container style="text-align:center; padding-top:50px;">
                  <v-form ref="form" v-model="isFormValid">
                    <v-text-field
                      v-model="email"
                      label="E-mail"
                      :rules="emailRules"
                      full-width
                    ></v-text-field>
                    <v-btn @click="enrollUser">Enroll</v-btn>
                  </v-form>
                </v-container>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar
      v-model="enrollmentHint"
      :timeout="enrollmentTimeout"
    >
      {{ text }}

      <template #action="{ attrs }">
        <v-btn
          color="blue"
          text
          v-bind="attrs"
          @click="enrollmentHint = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>

</template>

<script>

  export default {
    layout: 'default',
    data: () => ({
      enrollmentHint: false,
      enrollmentTimeout: 4000,
      text: '',
      showLogin: true,
      isFormValid: false,
      email: '',
      emailRules: [
        v => !!v || 'E-mail is required',
        v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(v) || 'E-mail must be valid'
      ],
      hideAll: false,
      challenge: {
        id: null,
        authImages: { 'qrcode-extended': null,  'qrcode-standard': null},
        authTokenUrl: null,
        authType: null,
        pollingUrl: null,
        socketsUrl: null,
        expiresAt: null
      },
      publicEnrollment: false,
    }),
    watch: {
      showLogin(newval, oldval) {
        if (!this.showLogin) {
          this.challenge.id = null;
          this.challenge.authImages = { 'qrcode-extended': null,  'qrcode-standard': null }
        } else {
          this.startChallenge();
        }
      }
    },
    mounted() {
      this.publicEnrollment = this.$config.publicEnrollment;
      this.startChallenge();
    },
    methods: {
      startChallenge() {
        const data = {"key": this.$config.accessKey}
        this.$axios.$post(`${this.$config.apiHost}/v1/entity/challenges`, data).then((response) => {
          this.challenge = response;
          this.checkChallenge(response.id);
        });
      },
      enrollUser() {

        this.$refs.form.validate();

        if (!this.isFormValid)
          return;

        this.enrollmentHint=true;
        const data = {"email": this.email};
        const me = this;
        this.$axios.post(`${this.$config.enrollmentUrl}`, data).then((response) => {
          if (response.status===200) {
            me.text = response.data.message;
            me.enrollmentHint=true;
            me.email="";
            me.showLogin=true;
          } else {
            me.enrollmentHint=true;
            me.text = response.error;
          }
        });

      },
      checkChallenge(challengeId) {
        this.$axios.get(this.challenge.pollingUrl).then((response) => {
          if (response.status===204 && this.showLogin) {
            this.checkChallenge(challengeId);
          } else if (response.status===200)  {
            this.$axios.get(`${this.$config.authControllerUrl}`, {
              headers: { 'X-Almefy-Auth': response.data.token }
            }).then(response => {
              if (response.status===200) {
                console.log('Got the roundtrip completly, create own JWT token based on secret with identity');
                this.$router.push(this.$config.homeRoute);
              }
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




