<template>
    <v-dialog width="350px" persistent v-model="editDialog">
        <v-btn accent slot="activator">
            Edit Time
        </v-btn>
        <v-card>
            <v-container>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-card-title>Edit Meetup Time</v-card-title>
                    </v-flex>
                </v-layout>
                <v-divider></v-divider>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-time-picker v-model="editableTime" style="width: 100%" actions>
                            <template slot-scope="{save, cancel}">
                                <v-btn class="blue--text darken-1" flat @click="editDialog = false">Close</v-btn>
                                <v-btn class="blue--text darken-1" flat @click="onSaveChanges">Save</v-btn>
                            </template>
                        </v-time-picker>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    import * as moment from 'moment'
    import { Actions } from '@/store/definitions'

    export default {
        data() {
            return {
                editDialog: false,
                editableTime: null
            }
        },
        props: ['meetup'],
        methods: {
            onSaveChanges() {
                const newDate = moment(this.meetup.date)
                const newTimePicked = moment(this.editableTime, 'HH:mm')
                newDate.hour(newTimePicked.hour())
                newDate.minute(newTimePicked.minute())
                this.$store.dispatch(Actions.UPDATE_MEETUP, {
                    id: this.meetup.id,
                    date: newDate
                })
            }
        },
        created() {
            this.editableTime = moment(this.meetup.date).format('HH:mm')
        }
    }
</script>
