<template>

  <v-app dark>

    <v-container fluid class="fill-height">
      <v-row v-show="showLogin" justify="center">
<<<<<<< HEAD
        <v-col cols="12" sm="6" md="6">
=======
        <v-col cols="12" sm="6" md="8">
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
          <v-card elevation="24">
            <v-row no-gutters>
              <v-col cols="12" md="8" class="black--text">
                <v-card-title class="text-h3"><Logo/></v-card-title>
                <v-card-subtitle class="text-h6">Sample Login on nuxt.js</v-card-subtitle>
                <v-card-text><small>Version 1.0a</small>
<<<<<<< HEAD
                <v-card-text><v-btn v-show="publicEnrollment" @click="showLogin = !showLogin">Enroll new user here</v-btn></v-card-text>
=======
                <v-card-text><v-btn v-show="publicEnrollmentMail || publicEnrollmentLocal" @click="showLogin = !showLogin">Connect user and device here</v-btn></v-card-text>
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
                </v-card-text>

              </v-col>

              <v-col cols="12" md="4">
                <v-container style="text-align:center; padding-top:30px;padding-right:50px;">
                  <div v-show="!hideAll" >
                  <div v-show="challenge.id==null">Initialising</div>
<<<<<<< HEAD
                  <div v-show="challenge.id!=null">Scan QR-Code</div>
=======
                  <div v-show="challenge.id!=null">Scan QR-Code if you are already connected</div>
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
                  <img v-show="challenge.authImages!=null" :src="challenge.authImages['qrcode-standard']" style="width:120px" />
                  </div>
                </v-container>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-show="!showLogin" justify="center">
<<<<<<< HEAD
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
=======
        <v-col cols="12" sm="6" md="8">
          <v-card elevation="24">
            <v-row no-gutters>
              <v-col cols="12" md="4" class="black--text">
                <v-card-title class="text-h3"><Logo/></v-card-title>
                <v-card-subtitle class="text-h6">Connect user and device here</v-card-subtitle>
                <v-card-text><small>Version 1.0a</small></v-card-text>
                <v-card-text><v-btn @click="enrollImages = null; email = ''; showLogin = !showLogin">Back to login</v-btn></v-card-text>
              </v-col>
              <v-col cols="12" md="8">
                <v-container style="text-align:center; padding-top:50px;">
                  <v-form ref="form" v-model="isFormValid">

                    <v-text-field
                      v-show="enrollImages==null"
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
                      v-model="email"
                      label="E-mail"
                      :rules="emailRules"
                      full-width
<<<<<<< HEAD
                    ></v-text-field>
                    <v-btn @click="enrollUser">Enroll</v-btn>
=======
                    >
                    </v-text-field>

                    <v-container v-show="enrollImages!=null">
                      <div>1. Connect your identity by scanning QR Code with Almefy-App.</div>
                      <div>2. Go Back to login</div>
                      <img :src="'data:image/jpeg;base64,'+ enrollImages" style="width:120px" /><br/>
                      <v-btn @click="enrollUserViaLocal">Get a new connect QR Code</v-btn>
                    </v-container>
                    <v-btn v-show="publicEnrollmentMail && enrollImages==null" @click="enrollUserViaMail">Connect via Mail</v-btn>
                    <v-btn v-show="publicEnrollmentLocal && enrollImages==null" @click="enrollUserViaLocal">Connect direct via Image</v-btn>

>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
                  </v-form>
                </v-container>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
<<<<<<< HEAD
<!--
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
  -->
=======
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
  </v-app>

</template>

<script>

  export default {
    layout: 'default',
    data: () => ({
<<<<<<< HEAD
      // enrollmentHint: false,
      // enrollmentTimeout: 4000,
      // text: '',
=======
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
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
<<<<<<< HEAD
      publicEnrollment: false,
=======
      publicEnrollmentMail: false,
      publicEnrollmentLocal: false,
      enrollImages: null,
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
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
<<<<<<< HEAD
      this.publicEnrollment = this.$config.publicEnrollment;
=======
      this.publicEnrollmentMail = this.$config.publicEnrollmentMail;
      this.publicEnrollmentLocal = this.$config.publicEnrollmentLocal;
      console.log(this.publicEnrollmentMail);
      console.log(this.publicEnrollmentLocal);
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
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
<<<<<<< HEAD
      enrollUser() {
=======
      enrollUserViaMail() {
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42

        this.$refs.form.validate();

        if (!this.isFormValid)
          return;

<<<<<<< HEAD
        const data = {"email": this.email};
        const me = this;

        this.$axios.post(`${this.$config.enrollmentUrl}`, data).then((response) => {
=======
        const data = {"email": this.email, "sendEnrollment": true};
        const me = this;

        this.$axios.post(`${this.$config.enrollmentUrl}`, data, {
          validateStatus (status) {
            return status < 500; // Resolve only if the status code is less than 500
          }
        }).then((response) => {
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
          if (response.status===200) {
            this.$dialog.notify.info(response.data.message, { position: 'bottom-right', timeout: 10000 });
            me.email="";
            me.showLogin=true;
          } else {
<<<<<<< HEAD
            this.$dialog.notify.error(response.error, { position: 'bottom-right', timeout: 10000 });
=======
            this.$dialog.notify.error(response.data.detail, { position: 'bottom-right', timeout: 10000 });
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
          }
        });

      },
<<<<<<< HEAD
=======
      enrollUserViaLocal() {

        this.$refs.form.validate();

        if (!this.isFormValid)
          return;

        const data = {"email": this.email, "sendEnrollment": false};
        // const me = this;

        this.$axios.post(`${this.$config.enrollmentUrl}`, data).then((response) => {
          if (response.status===200) {
            this.enrollImages = response.data.base64ImageData;
            console.log(this.enrollImages);
          } else {
            this.$dialog.notify.error(response.error, { position: 'bottom-right', timeout: 10000 });
          }
        });
      },
>>>>>>> 5b00c998c62f45dcce80298b4d461459477f3f42
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
                location.reload(this.$config.homeRoute)
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




