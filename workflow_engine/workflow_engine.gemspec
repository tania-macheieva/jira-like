# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name = 'workflow_engine'
  spec.version = '0.1.0'
  spec.authors = ['Tania Macheieva']
  spec.summary = 'A gem that provides a framework-independent way to manage issue workflow transitions.'
  spec.description = 'A gem that provides a framework-independent way to manage issue workflow transitions, allowing developers to define and enforce custom workflows for issues in their applications.'
  spec.homepage = 'https://github.com/tania-macheieva/jira-like'
  spec.license = 'MIT'
  spec.required_ruby_version = '>= 3.2'

  spec.files = Dir[File.join(__dir__, 'lib', '**', '*.rb')] + [__FILE__]
  spec.require_paths = ['lib']
end
