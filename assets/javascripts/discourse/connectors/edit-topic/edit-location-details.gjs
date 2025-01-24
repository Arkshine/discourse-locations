import Component from "@glimmer/component"
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import AddLocationControls from  "../../components/add-location-controls";
import { get } from "@ember/object";

export default class EditLocationDetails extends Component {
  @tracked location = get(this.args.outletArgs.buffered, 'location');

  @action
  updateLocation(location) {
    // this.args.outletArgs.buffered.location = location;
    this.args.outletArgs.buffered.buffer = {
      location: location
    }
    this.args.outletArgs.buffered.hasBufferedChanges = true;
    this.location = location;
  }

  <template>
    {{#if this.args.outletArgs.model.showLocationControls}}
      <AddLocationControls
        @location={{this.location}}
        @category={{this.args.outletArgs.buffered.category}}
        @updateLocation={{this.updateLocation}}
      />
    {{/if}} 
  </template>
}