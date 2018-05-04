<template>
    <v-dialog width="350px" persistent v-model="deleteDialog">
        <v-btn fab accent slot="activator">
            <v-icon>delete</v-icon>
        </v-btn>
        <v-card>
            <v-container>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-card-text>
                            Are you sure you wish to delete this meetup?
                        </v-card-text>
                    </v-flex>
                </v-layout>
                <v-divider></v-divider>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-card-actions>
                            <v-btn flat class="blue--text darken-1" @click="deleteDialog = false">Cancel</v-btn>
                            <v-btn flat class="red--text darken-1" @click="onDelete">Delete</v-btn>
                        </v-card-actions>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        data() {
            return {
                deleteDialog: false
            }
        },
        props: [ 'meetup' ],
        methods: {
            onDelete() {
                this.$store.dispatch('deleteMeetup', this.meetup.id)
                this.$router.push('/meetups')
            }
        }
    }
</script>
