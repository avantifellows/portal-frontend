<template>
  <div class="flex items-center mt-4 mb-2">
    <input 
      type="checkbox" 
      id="privacy-policy-checkbox" 
      class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
      :checked="checked"
      @change="toggleCheckbox"
    />
    <label for="privacy-policy-checkbox" class="ml-2 text-sm text-gray-700">
      By continuing, you agree to the terms in our 
      <a 
        href="https://www.avantifellows.org/privacy" 
        target="_blank" 
        class="text-primary hover:underline"
      >
        privacy policy
      </a>
    </label>
  </div>
</template>

<script>
export default {
  name: "PrivacyPolicyCheckbox",
  props: {
    modelValue: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    checked() {
      return this.modelValue;
    }
  },
  methods: {
    toggleCheckbox(event) {
      this.$emit('update:modelValue', event.target.checked);
    }
  }
}
</script> 