{
    "data": {
        "__schema": {
            "queryType": {
                "name": "Query"
            },
            "mutationType": {
                "name": "Mutation"
            },
            "subscriptionType": {
                "name": "Subscription"
            },
            "types": [
                {
                    "kind": "OBJECT",
                    "name": "AnalyticsQuery",
                    "description": "Queries for Analytics",
                    "fields": [
                        {
                            "name": "providers",
                            "description": "Fetch list of Analytics providers and their configuration",
                            "args": [
                                {
                                    "name": "isEnabled",
                                    "description": "Return only active providers",
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "AnalyticsProvider",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "SCALAR",
                    "name": "Boolean",
                    "description": "The `Boolean` scalar type represents `true` or `false`.",
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AnalyticsMutation",
                    "description": "Mutations for Analytics",
                    "fields": [
                        {
                            "name": "updateProviders",
                            "description": "Update a list of Analytics providers and their configuration",
                            "args": [
                                {
                                    "name": "providers",
                                    "description": "List of providers",
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "INPUT_OBJECT",
                                                "name": "AnalyticsProviderInput",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AnalyticsProvider",
                    "description": "Analytics Provider",
                    "fields": [
                        {
                            "name": "isEnabled",
                            "description": "Is the provider active",
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "key",
                            "description": "Unique identifier for this provider",
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "props",
                            "description": "List of configuration properties, formatted as stringified JSON objects",
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": "Name of the provider",
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": "Short description of the provider",
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isAvailable",
                            "description": "Is the provider available for use",
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "logo",
                            "description": "Path to the provider logo",
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "website",
                            "description": "Website of the provider",
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": "Configuration values for this provider",
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "KeyValuePair",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "SCALAR",
                    "name": "String",
                    "description": "The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.",
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "AnalyticsProviderInput",
                    "description": "Analytics Configuration Input",
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "isEnabled",
                            "description": "Is the provider active",
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "key",
                            "description": "Unique identifier of the provider",
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "config",
                            "description": "Configuration values for this provider",
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "INPUT_OBJECT",
                                    "name": "KeyValuePairInput",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AssetQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "list",
                            "description": null,
                            "args": [
                                {
                                    "name": "folderId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "kind",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "ENUM",
                                            "name": "AssetKind",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "AssetItem",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "folders",
                            "description": null,
                            "args": [
                                {
                                    "name": "parentFolderId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "AssetFolder",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "SCALAR",
                    "name": "Int",
                    "description": "The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.",
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AssetMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "createFolder",
                            "description": null,
                            "args": [
                                {
                                    "name": "parentFolderId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "slug",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "name",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "renameAsset",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "filename",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "deleteAsset",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "flushTempUploads",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AssetItem",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "filename",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ext",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "kind",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "ENUM",
                                    "name": "AssetKind",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "mime",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "fileSize",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "metadata",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "folder",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AssetFolder",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "author",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "User",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AssetFolder",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "slug",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "AssetKind",
                    "description": null,
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "IMAGE",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "BINARY",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ALL",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AuthenticationQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "apiKeys",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "AuthenticationApiKey",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "apiState",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "strategies",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "AuthenticationStrategy",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "activeStrategies",
                            "description": null,
                            "args": [
                                {
                                    "name": "enabledOnly",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "AuthenticationActiveStrategy",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AuthenticationMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "createApiKey",
                            "description": null,
                            "args": [
                                {
                                    "name": "name",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "expiration",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "fullAccess",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "group",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AuthenticationCreateApiKeyResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "login",
                            "description": null,
                            "args": [
                                {
                                    "name": "username",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "password",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "strategy",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AuthenticationLoginResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "loginTFA",
                            "description": null,
                            "args": [
                                {
                                    "name": "continuationToken",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securityCode",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "setup",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AuthenticationLoginResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "loginChangePassword",
                            "description": null,
                            "args": [
                                {
                                    "name": "continuationToken",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "newPassword",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AuthenticationLoginResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "forgotPassword",
                            "description": null,
                            "args": [
                                {
                                    "name": "email",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "register",
                            "description": null,
                            "args": [
                                {
                                    "name": "email",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "password",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "name",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AuthenticationRegisterResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "revokeApiKey",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "setApiState",
                            "description": null,
                            "args": [
                                {
                                    "name": "enabled",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updateStrategies",
                            "description": null,
                            "args": [
                                {
                                    "name": "strategies",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "INPUT_OBJECT",
                                                "name": "AuthenticationStrategyInput",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "regenerateCertificates",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "resetGuestUser",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AuthenticationStrategy",
                    "description": null,
                    "fields": [
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "props",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "KeyValuePair",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isAvailable",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "useForm",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "usernameType",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "logo",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "color",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "website",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "icon",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AuthenticationActiveStrategy",
                    "description": null,
                    "fields": [
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "strategy",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "AuthenticationStrategy",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "displayName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "order",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isEnabled",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "KeyValuePair",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "selfRegistration",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "domainWhitelist",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "autoEnrollGroups",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AuthenticationLoginResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ResponseStatus",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "jwt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "mustChangePwd",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "mustProvideTFA",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "mustSetupTFA",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "continuationToken",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "redirect",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tfaQRImage",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AuthenticationRegisterResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ResponseStatus",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "jwt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "AuthenticationStrategyInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "key",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "strategyKey",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "INPUT_OBJECT",
                                    "name": "KeyValuePairInput",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "displayName",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "order",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "isEnabled",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "selfRegistration",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "domainWhitelist",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "autoEnrollGroups",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    }
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AuthenticationApiKey",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "keyShort",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "expiration",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isRevoked",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "AuthenticationCreateApiKeyResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ResponseStatus",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "CommentQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "providers",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "CommentProvider",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "list",
                            "description": null,
                            "args": [
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "path",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "CommentPost",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "single",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "CommentPost",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "CommentMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "updateProviders",
                            "description": null,
                            "args": [
                                {
                                    "name": "providers",
                                    "description": null,
                                    "type": {
                                        "kind": "LIST",
                                        "name": null,
                                        "ofType": {
                                            "kind": "INPUT_OBJECT",
                                            "name": "CommentProviderInput",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "create",
                            "description": null,
                            "args": [
                                {
                                    "name": "pageId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "replyTo",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "content",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "guestName",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "guestEmail",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "CommentCreateResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "update",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "content",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "CommentUpdateResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "delete",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "CommentProvider",
                    "description": null,
                    "fields": [
                        {
                            "name": "isEnabled",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "logo",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "website",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isAvailable",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "KeyValuePair",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "CommentProviderInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "isEnabled",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "INPUT_OBJECT",
                                    "name": "KeyValuePairInput",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "CommentPost",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "content",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "render",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorEmail",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorIP",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "CommentCreateResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ResponseStatus",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "CommentUpdateResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ResponseStatus",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "render",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "KeyValuePair",
                    "description": "Generic Key Value Pair",
                    "fields": [
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "value",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "KeyValuePairInput",
                    "description": "General Key Value Pair Input",
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "key",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "value",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "DefaultResponse",
                    "description": "Generic Mutation Response",
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ResponseStatus",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "ResponseStatus",
                    "description": "Mutation Status",
                    "fields": [
                        {
                            "name": "succeeded",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "errorCode",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "slug",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "message",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "Query",
                    "description": "Query (Read)",
                    "fields": [
                        {
                            "name": "analytics",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AnalyticsQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "assets",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AssetQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authentication",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AuthenticationQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "comments",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "CommentQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "contribute",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ContributeQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "groups",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "GroupQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "localization",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "LocalizationQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "logging",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "LoggingQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "mail",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "MailQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "navigation",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "NavigationQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "pages",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "PageQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "rendering",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "RenderingQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "search",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SearchQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "site",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SiteQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "storage",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "StorageQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "system",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SystemQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "theming",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ThemingQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "users",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "UserQuery",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "Mutation",
                    "description": "Mutations (Create, Update, Delete)",
                    "fields": [
                        {
                            "name": "analytics",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AnalyticsMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "assets",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AssetMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authentication",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "AuthenticationMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "comments",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "CommentMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "groups",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "GroupMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "localization",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "LocalizationMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "logging",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "LoggingMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "mail",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "MailMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "navigation",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "NavigationMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "pages",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "PageMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "rendering",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "RenderingMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "search",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SearchMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "site",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SiteMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "storage",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "StorageMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "system",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SystemMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "theming",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ThemingMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "users",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "UserMutation",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "Subscription",
                    "description": "Subscriptions (Push, Real-time)",
                    "fields": [
                        {
                            "name": "loggingLiveTrail",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "LoggerTrailLine",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "ContributeQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "contributors",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "ContributeContributor",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "ContributeContributor",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "source",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "joined",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "website",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "twitter",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "avatar",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "GroupQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "list",
                            "description": null,
                            "args": [
                                {
                                    "name": "filter",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "orderBy",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "GroupMinimal",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "single",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "Group",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "GroupMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "create",
                            "description": null,
                            "args": [
                                {
                                    "name": "name",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "GroupResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "update",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "name",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "redirectOnLogin",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "permissions",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "SCALAR",
                                                "name": "String",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "pageRules",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "INPUT_OBJECT",
                                                "name": "PageRuleInput",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "delete",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "assignUser",
                            "description": null,
                            "args": [
                                {
                                    "name": "groupId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "userId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "unassignUser",
                            "description": null,
                            "args": [
                                {
                                    "name": "groupId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "userId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "GroupResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "ResponseStatus",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "group",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "Group",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "GroupMinimal",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isSystem",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "userCount",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "Group",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isSystem",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "redirectOnLogin",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "permissions",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "pageRules",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "PageRule",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "users",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "UserMinimal",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageRule",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "deny",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "match",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "ENUM",
                                    "name": "PageRuleMatch",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "roles",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "path",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "locales",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "PageRuleInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "id",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "deny",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "match",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "ENUM",
                                    "name": "PageRuleMatch",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "roles",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "path",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "locales",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "PageRuleMatch",
                    "description": null,
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "START",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "EXACT",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "END",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "REGEX",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "TAG",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "LocalizationQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "locales",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "LocalizationLocale",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "LocalizationConfig",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "translations",
                            "description": null,
                            "args": [
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "namespace",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "Translation",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "LocalizationMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "downloadLocale",
                            "description": null,
                            "args": [
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updateLocale",
                            "description": null,
                            "args": [
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "autoUpdate",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "namespacing",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "namespaces",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "SCALAR",
                                                "name": "String",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "LocalizationLocale",
                    "description": null,
                    "fields": [
                        {
                            "name": "availability",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "code",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "installDate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Date",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isInstalled",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isRTL",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "nativeName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "LocalizationConfig",
                    "description": null,
                    "fields": [
                        {
                            "name": "locale",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "autoUpdate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "namespacing",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "namespaces",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "Translation",
                    "description": null,
                    "fields": [
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "value",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "LoggingQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "loggers",
                            "description": null,
                            "args": [
                                {
                                    "name": "filter",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "orderBy",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "Logger",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "LoggingMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "updateLoggers",
                            "description": null,
                            "args": [
                                {
                                    "name": "loggers",
                                    "description": null,
                                    "type": {
                                        "kind": "LIST",
                                        "name": null,
                                        "ofType": {
                                            "kind": "INPUT_OBJECT",
                                            "name": "LoggerInput",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "Logger",
                    "description": null,
                    "fields": [
                        {
                            "name": "isEnabled",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "logo",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "website",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "level",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "KeyValuePair",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "LoggerInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "isEnabled",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "level",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "INPUT_OBJECT",
                                    "name": "KeyValuePairInput",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "LoggerTrailLine",
                    "description": null,
                    "fields": [
                        {
                            "name": "level",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "output",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "timestamp",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "MailQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "MailConfig",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "MailMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "sendTest",
                            "description": null,
                            "args": [
                                {
                                    "name": "recipientEmail",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updateConfig",
                            "description": null,
                            "args": [
                                {
                                    "name": "senderName",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "senderEmail",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "host",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "port",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "name",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "secure",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "verifySSL",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "user",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "pass",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "useDKIM",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "dkimDomainName",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "dkimKeySelector",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "dkimPrivateKey",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "MailConfig",
                    "description": null,
                    "fields": [
                        {
                            "name": "senderName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "senderEmail",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "host",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "port",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "secure",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "verifySSL",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "user",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "pass",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "useDKIM",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "dkimDomainName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "dkimKeySelector",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "dkimPrivateKey",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "NavigationQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "tree",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "NavigationTree",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "NavigationConfig",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "NavigationMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "updateTree",
                            "description": null,
                            "args": [
                                {
                                    "name": "tree",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "INPUT_OBJECT",
                                                "name": "NavigationTreeInput",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updateConfig",
                            "description": null,
                            "args": [
                                {
                                    "name": "mode",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "ENUM",
                                            "name": "NavigationMode",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "NavigationTree",
                    "description": null,
                    "fields": [
                        {
                            "name": "locale",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "items",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "NavigationItem",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "NavigationTreeInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "locale",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "items",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "INPUT_OBJECT",
                                        "name": "NavigationItemInput",
                                        "ofType": null
                                    }
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "NavigationItem",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "kind",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "label",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "icon",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "targetType",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "target",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "visibilityMode",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "visibilityGroups",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "NavigationItemInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "id",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "kind",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "label",
                            "description": null,
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "icon",
                            "description": null,
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "targetType",
                            "description": null,
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "target",
                            "description": null,
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "visibilityMode",
                            "description": null,
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "visibilityGroups",
                            "description": null,
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "NavigationConfig",
                    "description": null,
                    "fields": [
                        {
                            "name": "mode",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "ENUM",
                                    "name": "NavigationMode",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "NavigationMode",
                    "description": null,
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "NONE",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "TREE",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "MIXED",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "STATIC",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "history",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "offsetPage",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "offsetSize",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "PageHistoryResult",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "version",
                            "description": null,
                            "args": [
                                {
                                    "name": "pageId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "versionId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "PageVersion",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "search",
                            "description": null,
                            "args": [
                                {
                                    "name": "query",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "path",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "PageSearchResponse",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "list",
                            "description": null,
                            "args": [
                                {
                                    "name": "limit",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "orderBy",
                                    "description": null,
                                    "type": {
                                        "kind": "ENUM",
                                        "name": "PageOrderBy",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "orderByDirection",
                                    "description": null,
                                    "type": {
                                        "kind": "ENUM",
                                        "name": "PageOrderByDirection",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "tags",
                                    "description": null,
                                    "type": {
                                        "kind": "LIST",
                                        "name": null,
                                        "ofType": {
                                            "kind": "NON_NULL",
                                            "name": null,
                                            "ofType": {
                                                "kind": "SCALAR",
                                                "name": "String",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "creatorId",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "authorId",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "OBJECT",
                                            "name": "PageListItem",
                                            "ofType": null
                                        }
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "single",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "Page",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "singleByPath",
                            "description": null,
                            "args": [
                                {
                                    "name": "path",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "Page",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tags",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "PageTag",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "searchTags",
                            "description": null,
                            "args": [
                                {
                                    "name": "query",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tree",
                            "description": null,
                            "args": [
                                {
                                    "name": "path",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "parent",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "mode",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "ENUM",
                                            "name": "PageTreeMode",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "includeAncestors",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "PageTreeItem",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "links",
                            "description": null,
                            "args": [
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "PageLinkItem",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "checkConflicts",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "checkoutDate",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Date",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "conflictLatest",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "PageConflictLatest",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "create",
                            "description": null,
                            "args": [
                                {
                                    "name": "content",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "description",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editor",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "isPublished",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "isPrivate",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "path",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "publishEndDate",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Date",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "publishStartDate",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Date",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "scriptCss",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "scriptJs",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "tags",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "SCALAR",
                                                "name": "String",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "title",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "PageResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "update",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "content",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "description",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editor",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "isPrivate",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "isPublished",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "locale",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "path",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "publishEndDate",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Date",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "publishStartDate",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Date",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "scriptCss",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "scriptJs",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "tags",
                                    "description": null,
                                    "type": {
                                        "kind": "LIST",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "title",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "PageResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "convert",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editor",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "move",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "destinationPath",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "destinationLocale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "delete",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "deleteTag",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updateTag",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "tag",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "title",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "flushCache",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "migrateToLocale",
                            "description": null,
                            "args": [
                                {
                                    "name": "sourceLocale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "targetLocale",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "PageMigrationResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "rebuildTree",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "render",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "restore",
                            "description": null,
                            "args": [
                                {
                                    "name": "pageId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "versionId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "purgeHistory",
                            "description": null,
                            "args": [
                                {
                                    "name": "olderThan",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "ResponseStatus",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "page",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "Page",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageMigrationResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "ResponseStatus",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "count",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "Page",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "path",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "hash",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isPrivate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isPublished",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "privateNS",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "publishStartDate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "publishEndDate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tags",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "PageTag",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "content",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "render",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "toc",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "contentType",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "editor",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "locale",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "scriptCss",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "scriptJs",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorEmail",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "creatorId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "creatorName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "creatorEmail",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageTag",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tag",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageHistory",
                    "description": null,
                    "fields": [
                        {
                            "name": "versionId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "versionDate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "actionType",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "valueBefore",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "valueAfter",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageVersion",
                    "description": null,
                    "fields": [
                        {
                            "name": "action",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "content",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "contentType",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "versionDate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "editor",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isPrivate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isPublished",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "locale",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "pageId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "path",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "publishEndDate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "publishStartDate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tags",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "versionId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageHistoryResult",
                    "description": null,
                    "fields": [
                        {
                            "name": "trail",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "PageHistory",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "total",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageSearchResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "results",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "PageSearchResult",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "suggestions",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "totalHits",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageSearchResult",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "path",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "locale",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageListItem",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "path",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "locale",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "contentType",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isPublished",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isPrivate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "privateNS",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tags",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageTreeItem",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "path",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "depth",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isPrivate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isFolder",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "privateNS",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "parent",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "pageId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "locale",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageLinkItem",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "path",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "links",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "PageConflictLatest",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authorName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "content",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isPublished",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "locale",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "path",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tags",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "PageOrderBy",
                    "description": null,
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "CREATED",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ID",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "PATH",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "TITLE",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "UPDATED",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "PageOrderByDirection",
                    "description": null,
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "ASC",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "DESC",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "PageTreeMode",
                    "description": null,
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "FOLDERS",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "PAGES",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ALL",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "RenderingQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "renderers",
                            "description": null,
                            "args": [
                                {
                                    "name": "filter",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "orderBy",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "Renderer",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "RenderingMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "updateRenderers",
                            "description": null,
                            "args": [
                                {
                                    "name": "renderers",
                                    "description": null,
                                    "type": {
                                        "kind": "LIST",
                                        "name": null,
                                        "ofType": {
                                            "kind": "INPUT_OBJECT",
                                            "name": "RendererInput",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "Renderer",
                    "description": null,
                    "fields": [
                        {
                            "name": "isEnabled",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "icon",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "dependsOn",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "input",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "output",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "KeyValuePair",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "RendererInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "isEnabled",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "INPUT_OBJECT",
                                    "name": "KeyValuePairInput",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "SCALAR",
                    "name": "Date",
                    "description": null,
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SearchQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "searchEngines",
                            "description": null,
                            "args": [
                                {
                                    "name": "filter",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "orderBy",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "SearchEngine",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SearchMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "updateSearchEngines",
                            "description": null,
                            "args": [
                                {
                                    "name": "engines",
                                    "description": null,
                                    "type": {
                                        "kind": "LIST",
                                        "name": null,
                                        "ofType": {
                                            "kind": "INPUT_OBJECT",
                                            "name": "SearchEngineInput",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "rebuildIndex",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SearchEngine",
                    "description": null,
                    "fields": [
                        {
                            "name": "isEnabled",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "logo",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "website",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isAvailable",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "KeyValuePair",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "SearchEngineInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "isEnabled",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "INPUT_OBJECT",
                                    "name": "KeyValuePairInput",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SiteQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SiteConfig",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SiteMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "updateConfig",
                            "description": null,
                            "args": [
                                {
                                    "name": "host",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "title",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "description",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "robots",
                                    "description": null,
                                    "type": {
                                        "kind": "LIST",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "analyticsService",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "analyticsId",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "company",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "contentLicense",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "footerOverride",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "logoUrl",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "pageExtensions",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "authAutoLogin",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "authEnforce2FA",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "authHideLocal",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "authLoginBgUrl",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "authJwtAudience",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "authJwtExpiration",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "authJwtRenewablePeriod",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editFab",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editMenuBar",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editMenuBtn",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editMenuExternalBtn",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editMenuExternalName",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editMenuExternalIcon",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "editMenuExternalUrl",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "featurePageRatings",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "featurePageComments",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "featurePersonalWikis",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securityOpenRedirect",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securityIframe",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securityReferrerPolicy",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securityTrustProxy",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securitySRI",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securityHSTS",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securityHSTSDuration",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securityCSP",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "securityCSPDirectives",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "uploadMaxFileSize",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "uploadMaxFiles",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Int",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "uploadScanSVG",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "uploadForceDownload",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SiteConfig",
                    "description": null,
                    "fields": [
                        {
                            "name": "host",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "robots",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "analyticsService",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "analyticsId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "company",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "contentLicense",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "footerOverride",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "logoUrl",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "pageExtensions",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authAutoLogin",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authEnforce2FA",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authHideLocal",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authLoginBgUrl",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authJwtAudience",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authJwtExpiration",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "authJwtRenewablePeriod",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "editFab",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "editMenuBar",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "editMenuBtn",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "editMenuExternalBtn",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "editMenuExternalName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "editMenuExternalIcon",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "editMenuExternalUrl",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "featurePageRatings",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "featurePageComments",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "featurePersonalWikis",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "securityOpenRedirect",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "securityIframe",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "securityReferrerPolicy",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "securityTrustProxy",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "securitySRI",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "securityHSTS",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "securityHSTSDuration",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "securityCSP",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "securityCSPDirectives",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "uploadMaxFileSize",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "uploadMaxFiles",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "uploadScanSVG",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "uploadForceDownload",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "StorageQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "targets",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "StorageTarget",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "status",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "StorageStatus",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "StorageMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "updateTargets",
                            "description": null,
                            "args": [
                                {
                                    "name": "targets",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "INPUT_OBJECT",
                                                "name": "StorageTargetInput",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "executeAction",
                            "description": null,
                            "args": [
                                {
                                    "name": "targetKey",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "handler",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "StorageTarget",
                    "description": null,
                    "fields": [
                        {
                            "name": "isAvailable",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isEnabled",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "logo",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "website",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "supportedModes",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "mode",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "hasSchedule",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "syncInterval",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "syncIntervalDefault",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "KeyValuePair",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "actions",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "StorageTargetAction",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "StorageTargetInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "isEnabled",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "key",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "mode",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "syncInterval",
                            "description": null,
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "INPUT_OBJECT",
                                    "name": "KeyValuePairInput",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "StorageStatus",
                    "description": null,
                    "fields": [
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "status",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "message",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "lastAttempt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "StorageTargetAction",
                    "description": null,
                    "fields": [
                        {
                            "name": "handler",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "label",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "hint",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SystemQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "flags",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "SystemFlag",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "info",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SystemInfo",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "extensions",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "SystemExtension",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "exportStatus",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SystemExportStatus",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SystemMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "updateFlags",
                            "description": null,
                            "args": [
                                {
                                    "name": "flags",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "INPUT_OBJECT",
                                                "name": "SystemFlagInput",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "resetTelemetryClientId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "setTelemetry",
                            "description": null,
                            "args": [
                                {
                                    "name": "enabled",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "performUpgrade",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "importUsersFromV1",
                            "description": null,
                            "args": [
                                {
                                    "name": "mongoDbConnString",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "groupMode",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "ENUM",
                                            "name": "SystemImportUsersGroupMode",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "SystemImportUsersResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "setHTTPSRedirection",
                            "description": null,
                            "args": [
                                {
                                    "name": "enabled",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "renewHTTPSCertificate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "export",
                            "description": null,
                            "args": [
                                {
                                    "name": "entities",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "SCALAR",
                                                "name": "String",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "path",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SystemFlag",
                    "description": null,
                    "fields": [
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "value",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "INPUT_OBJECT",
                    "name": "SystemFlagInput",
                    "description": null,
                    "fields": null,
                    "inputFields": [
                        {
                            "name": "key",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "value",
                            "description": null,
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ],
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SystemInfo",
                    "description": null,
                    "fields": [
                        {
                            "name": "configFile",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "cpuCores",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "currentVersion",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "dbHost",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "dbType",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "dbVersion",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "groupsTotal",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "hostname",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "httpPort",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "httpRedirection",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "httpsPort",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "latestVersion",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "latestVersionReleaseDate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Date",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "nodeVersion",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "operatingSystem",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "pagesTotal",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "platform",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ramTotal",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "sslDomain",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "sslExpirationDate",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Date",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "sslProvider",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "sslStatus",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "sslSubscriberEmail",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tagsTotal",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "telemetry",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "telemetryClientId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "upgradeCapable",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "usersTotal",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "workingDirectory",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "SystemImportUsersGroupMode",
                    "description": null,
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "MULTI",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "SINGLE",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "NONE",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SystemImportUsersResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ResponseStatus",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "usersCount",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "groupsCount",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "failed",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "SystemImportUsersResponseFailed",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SystemImportUsersResponseFailed",
                    "description": null,
                    "fields": [
                        {
                            "name": "provider",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "email",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "error",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SystemExtension",
                    "description": null,
                    "fields": [
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isInstalled",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isCompatible",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "SystemExportStatus",
                    "description": null,
                    "fields": [
                        {
                            "name": "status",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "progress",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "message",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "startedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Date",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "ThemingQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "themes",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "ThemingTheme",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "config",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "ThemingConfig",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "ThemingMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "setConfig",
                            "description": null,
                            "args": [
                                {
                                    "name": "theme",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "iconset",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "darkMode",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Boolean",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "tocPosition",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "injectCSS",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "injectHead",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "injectBody",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "ThemingConfig",
                    "description": null,
                    "fields": [
                        {
                            "name": "theme",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "iconset",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "darkMode",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tocPosition",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "injectCSS",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "injectHead",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "injectBody",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "ThemingTheme",
                    "description": null,
                    "fields": [
                        {
                            "name": "key",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "title",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "author",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "UserQuery",
                    "description": null,
                    "fields": [
                        {
                            "name": "list",
                            "description": null,
                            "args": [
                                {
                                    "name": "filter",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "orderBy",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "UserMinimal",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "search",
                            "description": null,
                            "args": [
                                {
                                    "name": "query",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "UserMinimal",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "single",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "User",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "profile",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "UserProfile",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "lastLogins",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "UserLastLogin",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "UserMutation",
                    "description": null,
                    "fields": [
                        {
                            "name": "create",
                            "description": null,
                            "args": [
                                {
                                    "name": "email",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "name",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "passwordRaw",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "providerKey",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "groups",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "LIST",
                                            "name": null,
                                            "ofType": {
                                                "kind": "SCALAR",
                                                "name": "Int",
                                                "ofType": null
                                            }
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "mustChangePassword",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "sendWelcomeEmail",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "UserResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "update",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "email",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "name",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "newPassword",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "groups",
                                    "description": null,
                                    "type": {
                                        "kind": "LIST",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "location",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "jobTitle",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "timezone",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "dateFormat",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "appearance",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "delete",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "replaceId",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "verify",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "activate",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "deactivate",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "enableTFA",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "disableTFA",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "resetPassword",
                            "description": null,
                            "args": [
                                {
                                    "name": "id",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "Int",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "DefaultResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updateProfile",
                            "description": null,
                            "args": [
                                {
                                    "name": "name",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "location",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "jobTitle",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "timezone",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "dateFormat",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "appearance",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "UserTokenResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "changePassword",
                            "description": null,
                            "args": [
                                {
                                    "name": "current",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                },
                                {
                                    "name": "new",
                                    "description": null,
                                    "type": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "SCALAR",
                                            "name": "String",
                                            "ofType": null
                                        }
                                    },
                                    "defaultValue": null
                                }
                            ],
                            "type": {
                                "kind": "OBJECT",
                                "name": "UserTokenResponse",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "UserResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "ResponseStatus",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "user",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "User",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "UserLastLogin",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "lastLoginAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "UserMinimal",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "email",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "providerKey",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isSystem",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isActive",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "lastLoginAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Date",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "User",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "email",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "providerKey",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "providerName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "providerId",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "providerIs2FACapable",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Boolean",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isSystem",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isActive",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isVerified",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "location",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "jobTitle",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "timezone",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "dateFormat",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "appearance",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "lastLoginAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Date",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "tfaIsActive",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "groups",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "Group",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "UserProfile",
                    "description": null,
                    "fields": [
                        {
                            "name": "id",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "email",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "providerKey",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "providerName",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isSystem",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isVerified",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "location",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "jobTitle",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "timezone",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "dateFormat",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "appearance",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "createdAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "updatedAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Date",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "lastLoginAt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "Date",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "groups",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "SCALAR",
                                        "name": "String",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "pagesTotal",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "UserTokenResponse",
                    "description": null,
                    "fields": [
                        {
                            "name": "responseResult",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "ResponseStatus",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "jwt",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "CacheControlScope",
                    "description": null,
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "PUBLIC",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "PRIVATE",
                            "description": null,
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                },
                {
                    "kind": "SCALAR",
                    "name": "Upload",
                    "description": "The `Upload` scalar type represents a file upload.",
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "__Schema",
                    "description": "A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations.",
                    "fields": [
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "types",
                            "description": "A list of all types supported by this server.",
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "OBJECT",
                                            "name": "__Type",
                                            "ofType": null
                                        }
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "queryType",
                            "description": "The type that query operations will be rooted at.",
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "__Type",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "mutationType",
                            "description": "If this server supports mutation, the type that mutation operations will be rooted at.",
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "__Type",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "subscriptionType",
                            "description": "If this server support subscription, the type that subscription operations will be rooted at.",
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "__Type",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "directives",
                            "description": "A list of all directives supported by this server.",
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "OBJECT",
                                            "name": "__Directive",
                                            "ofType": null
                                        }
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "__Type",
                    "description": "The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.\n\nDepending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByUrl`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.",
                    "fields": [
                        {
                            "name": "kind",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "ENUM",
                                    "name": "__TypeKind",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "specifiedByUrl",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "fields",
                            "description": null,
                            "args": [
                                {
                                    "name": "includeDeprecated",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": "false"
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "NON_NULL",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "__Field",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "interfaces",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "NON_NULL",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "__Type",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "possibleTypes",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "NON_NULL",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "__Type",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "enumValues",
                            "description": null,
                            "args": [
                                {
                                    "name": "includeDeprecated",
                                    "description": null,
                                    "type": {
                                        "kind": "SCALAR",
                                        "name": "Boolean",
                                        "ofType": null
                                    },
                                    "defaultValue": "false"
                                }
                            ],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "NON_NULL",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "__EnumValue",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "inputFields",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "NON_NULL",
                                    "name": null,
                                    "ofType": {
                                        "kind": "OBJECT",
                                        "name": "__InputValue",
                                        "ofType": null
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ofType",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "OBJECT",
                                "name": "__Type",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "__TypeKind",
                    "description": "An enum describing what kind of type a given `__Type` is.",
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "SCALAR",
                            "description": "Indicates this type is a scalar.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "OBJECT",
                            "description": "Indicates this type is an object. `fields` and `interfaces` are valid fields.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "INTERFACE",
                            "description": "Indicates this type is an interface. `fields`, `interfaces`, and `possibleTypes` are valid fields.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "UNION",
                            "description": "Indicates this type is a union. `possibleTypes` is a valid field.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ENUM",
                            "description": "Indicates this type is an enum. `enumValues` is a valid field.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "INPUT_OBJECT",
                            "description": "Indicates this type is an input object. `inputFields` is a valid field.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "LIST",
                            "description": "Indicates this type is a list. `ofType` is a valid field.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "NON_NULL",
                            "description": "Indicates this type is a non-null. `ofType` is a valid field.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "__Field",
                    "description": "Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type.",
                    "fields": [
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "args",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "OBJECT",
                                            "name": "__InputValue",
                                            "ofType": null
                                        }
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "type",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "__Type",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isDeprecated",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "deprecationReason",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "__InputValue",
                    "description": "Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value.",
                    "fields": [
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "type",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "OBJECT",
                                    "name": "__Type",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "defaultValue",
                            "description": "A GraphQL-formatted string representing the default value for this input value.",
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "__EnumValue",
                    "description": "One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string.",
                    "fields": [
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isDeprecated",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "deprecationReason",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "OBJECT",
                    "name": "__Directive",
                    "description": "A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.\n\nIn some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.",
                    "fields": [
                        {
                            "name": "name",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "description",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "isRepeatable",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "locations",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "ENUM",
                                            "name": "__DirectiveLocation",
                                            "ofType": null
                                        }
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "args",
                            "description": null,
                            "args": [],
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "LIST",
                                    "name": null,
                                    "ofType": {
                                        "kind": "NON_NULL",
                                        "name": null,
                                        "ofType": {
                                            "kind": "OBJECT",
                                            "name": "__InputValue",
                                            "ofType": null
                                        }
                                    }
                                }
                            },
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "inputFields": null,
                    "interfaces": [],
                    "enumValues": null,
                    "possibleTypes": null
                },
                {
                    "kind": "ENUM",
                    "name": "__DirectiveLocation",
                    "description": "A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies.",
                    "fields": null,
                    "inputFields": null,
                    "interfaces": null,
                    "enumValues": [
                        {
                            "name": "QUERY",
                            "description": "Location adjacent to a query operation.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "MUTATION",
                            "description": "Location adjacent to a mutation operation.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "SUBSCRIPTION",
                            "description": "Location adjacent to a subscription operation.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "FIELD",
                            "description": "Location adjacent to a field.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "FRAGMENT_DEFINITION",
                            "description": "Location adjacent to a fragment definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "FRAGMENT_SPREAD",
                            "description": "Location adjacent to a fragment spread.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "INLINE_FRAGMENT",
                            "description": "Location adjacent to an inline fragment.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "VARIABLE_DEFINITION",
                            "description": "Location adjacent to a variable definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "SCHEMA",
                            "description": "Location adjacent to a schema definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "SCALAR",
                            "description": "Location adjacent to a scalar definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "OBJECT",
                            "description": "Location adjacent to an object type definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "FIELD_DEFINITION",
                            "description": "Location adjacent to a field definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ARGUMENT_DEFINITION",
                            "description": "Location adjacent to an argument definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "INTERFACE",
                            "description": "Location adjacent to an interface definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "UNION",
                            "description": "Location adjacent to a union definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ENUM",
                            "description": "Location adjacent to an enum definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "ENUM_VALUE",
                            "description": "Location adjacent to an enum value definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "INPUT_OBJECT",
                            "description": "Location adjacent to an input object type definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        },
                        {
                            "name": "INPUT_FIELD_DEFINITION",
                            "description": "Location adjacent to an input object field definition.",
                            "isDeprecated": false,
                            "deprecationReason": null
                        }
                    ],
                    "possibleTypes": null
                }
            ],
            "directives": [
                {
                    "name": "rateLimit",
                    "description": "Controls the rate of traffic.",
                    "locations": [
                        "OBJECT",
                        "FIELD_DEFINITION"
                    ],
                    "args": [
                        {
                            "name": "limit",
                            "description": "Number of occurrences allowed over duration.",
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "defaultValue": "60"
                        },
                        {
                            "name": "duration",
                            "description": "Number of seconds before limit is reset.",
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Int",
                                    "ofType": null
                                }
                            },
                            "defaultValue": "60"
                        }
                    ]
                },
                {
                    "name": "auth",
                    "description": null,
                    "locations": [
                        "QUERY",
                        "FIELD_DEFINITION",
                        "ARGUMENT_DEFINITION"
                    ],
                    "args": [
                        {
                            "name": "requires",
                            "description": null,
                            "type": {
                                "kind": "LIST",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ]
                },
                {
                    "name": "cacheControl",
                    "description": null,
                    "locations": [
                        "FIELD_DEFINITION",
                        "OBJECT",
                        "INTERFACE"
                    ],
                    "args": [
                        {
                            "name": "maxAge",
                            "description": null,
                            "type": {
                                "kind": "SCALAR",
                                "name": "Int",
                                "ofType": null
                            },
                            "defaultValue": null
                        },
                        {
                            "name": "scope",
                            "description": null,
                            "type": {
                                "kind": "ENUM",
                                "name": "CacheControlScope",
                                "ofType": null
                            },
                            "defaultValue": null
                        }
                    ]
                },
                {
                    "name": "skip",
                    "description": "Directs the executor to skip this field or fragment when the `if` argument is true.",
                    "locations": [
                        "FIELD",
                        "FRAGMENT_SPREAD",
                        "INLINE_FRAGMENT"
                    ],
                    "args": [
                        {
                            "name": "if",
                            "description": "Skipped when true.",
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ]
                },
                {
                    "name": "include",
                    "description": "Directs the executor to include this field or fragment only when the `if` argument is true.",
                    "locations": [
                        "FIELD",
                        "FRAGMENT_SPREAD",
                        "INLINE_FRAGMENT"
                    ],
                    "args": [
                        {
                            "name": "if",
                            "description": "Included when true.",
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "Boolean",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ]
                },
                {
                    "name": "deprecated",
                    "description": "Marks an element of a GraphQL schema as no longer supported.",
                    "locations": [
                        "FIELD_DEFINITION",
                        "ENUM_VALUE"
                    ],
                    "args": [
                        {
                            "name": "reason",
                            "description": "Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax, as specified by [CommonMark](https://commonmark.org/).",
                            "type": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            },
                            "defaultValue": "\"No longer supported\""
                        }
                    ]
                },
                {
                    "name": "specifiedBy",
                    "description": "Exposes a URL that specifies the behaviour of this scalar.",
                    "locations": [
                        "SCALAR"
                    ],
                    "args": [
                        {
                            "name": "url",
                            "description": "The URL that specifies the behaviour of this scalar.",
                            "type": {
                                "kind": "NON_NULL",
                                "name": null,
                                "ofType": {
                                    "kind": "SCALAR",
                                    "name": "String",
                                    "ofType": null
                                }
                            },
                            "defaultValue": null
                        }
                    ]
                }
            ]
        }
    }
}