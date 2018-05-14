<template>
    <v-card :class="cardClass">
        <v-container fluid>
            <v-layout row>
                <v-flex xs5 sm4 md3>
                    <v-card-media :src="meetup.imageUrl" height="130px"></v-card-media>
                </v-flex>
                <v-flex xs7 sm8 md9>
                    <v-card-title primary-title>
                        <div>
                            <h4 class="white--text mb-0" v-if="userIsRegistered">{{ meetup.title }} (Registered)</h4>
                            <h4 class="white--text mb-0" v-else>{{ meetup.title }}</h4>
                            <div v-if="userIsCreator" class="white--text">Organized by you</div>
                            <div v-else>Organized by {{ meetup.creatorName }}</div>
                            <div>{{ meetup.date | date }}</div>
                        </div>
                    </v-card-title>
                    <v-card-actions>
                        <v-btn flat :to="'/meetups/' + meetup.id">
                            <v-icon left light>arrow_forward</v-icon>
                            View Meetup
                        </v-btn>
                    </v-card-actions>
                </v-flex>
            </v-layout>
        </v-container>
    </v-card>
</template>

<script>
    export default {
        props: ['meetup'],
        computed: {
            user() {
                return this.$store.getters.user
            },
            userIsCreator() {
                return this.user && this.meetup.creatorId === this.user.id
            },
            userIsRegistered() {
                return this.user && this.user.registeredMeetups.includes(this.meetup.id)
            },
            cardClass() {
                if (this.userIsCreator) {
                    return 'red darken-2'
                } else if (this.userIsRegistered) {
                    return 'green darken-1'
                } else {
                    return 'primary'
                }
            }
        }
    }
</script>

<style scoped>

</style>
