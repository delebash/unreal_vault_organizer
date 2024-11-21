import {ENDPOINTS, VARS} from './globals'
import {db} from './db.js'
import lodash from 'lodash'

export const api = {

  async getUserSettings(id = 1) {
    return db.userSettings.get(id)
  },
  async saveUserSettings(data, id = 1) {
    const user = await this.getUserSettings(id)
    if (user === undefined) {
      //add id for new user only 1 user currently
      data.id = id
      await db.userSettings.add(data)
    } else {
      await db.userSettings.update(id, {...data})
    }
  },
  async updateVaultItem(id, data) {
    await db.vaultLibrary.update(id, vaultItem)
  },
  async saveVaultItems(data) {
    let bulk = [
      {
        'assetId': '8c09b41c22f5472ebdf9b12a5d36a72e',
        'assetNamespace': '89efe5924d3d467c839449ab6ab52e7f',
        'categories': [
          {
            'id': '0a4f7590-4376-400b-a6e4-c7a658cbab47',
            'name': 'Humans'
          }
        ],
        'description': 'Paragon: Kallari',
        'distributionMethod': 'ASSET_PACK',
        'images': [
          {
            'md5': null,
            'type': 'Featured',
            'url': 'https://media.fab.com/image_previews/gallery_images/2b20d84c-1d20-4228-b9c1-604d2a468e08/f3204a85-df23-4d1f-a8d6-ffabbe19e19e.jpg',
            'width': '640',
            'height': '349',
            'uploadedDate': '2024-10-17T08:59:44.005557Z'
          }
        ],
        'projectVersions': [
          {
            'artifactId': 'ParagonKallari',
            'engineVersions': [
              'UE_4.19',
              'UE_4.20',
              'UE_4.21',
              'UE_4.22',
              'UE_4.23',
              'UE_4.24',
              'UE_4.25',
              'UE_4.26',
              'UE_4.27',
              'UE_5.0',
              'UE_5.1',
              'UE_5.2',
              'UE_5.3',
              'UE_5.4'
            ],
            'targetPlatforms': [
              'Windows'
            ],
            'buildVersions': [
              {
                'buildVersion': '4.21.0-4393602+++depot+UE4-UserContent-Windows',
                'platform': 'Windows'
              }
            ]
          }
        ],
        'source': 'fab',
        'title': 'Paragon: Kallari',
        'url': 'https://www.fab.com/listings/ec8f2cb8-f904-4473-902f-67ade18bd225',
        'customAttributes': [
          {
            'ListingIdentifier': 'ec8f2cb8-f904-4473-902f-67ade18bd225'
          }
        ],
        'legacyItemId': 'b8bb5e8b8c63428aa5fd73525c2eddad'
      },
      {
        'assetId': '8cm9b41c22f5472ebdf9b12a5d36a72e',
        'assetNamespace': '89efe5924d3d467c839449ab6ab52e7f',
        'categories': [
          {
            'id': '0a4f7590-4376-400b-a6e4-c7a658cbab47',
            'name': 'Humans'
          }
        ],
        'description': 'Paragon: Kallari',
        'distributionMethod': 'ASSET_PACK',
        'images': [
          {
            'md5': null,
            'type': 'Featured',
            'url': 'https://media.fab.com/image_previews/gallery_images/2b20d84c-1d20-4228-b9c1-604d2a468e08/f3204a85-df23-4d1f-a8d6-ffabbe19e19e.jpg',
            'width': '640',
            'height': '349',
            'uploadedDate': '2024-10-17T08:59:44.005557Z'
          }
        ],
        'projectVersions': [
          {
            'artifactId': 'ParagonKallari',
            'engineVersions': [
              'UE_4.19',
              'UE_4.20',
              'UE_4.21',
              'UE_4.22',
              'UE_4.23',
              'UE_4.24',
              'UE_4.25',
              'UE_4.26',
              'UE_4.27',
              'UE_5.0',
              'UE_5.1',
              'UE_5.2',
              'UE_5.3',
              'UE_5.4'
            ],
            'targetPlatforms': [
              'Windows'
            ],
            'buildVersions': [
              {
                'buildVersion': '4.21.0-4393602+++depot+UE4-UserContent-Windows',
                'platform': 'Windows'
              }
            ]
          }
        ],
        'source': 'fab',
        'title': 'Paragon: Kallari',
        'url': 'https://www.fab.com/listings/ec8f2cb8-f904-4473-902f-67ade18bd225',
        'customAttributes': [
          {
            'ListingIdentifier': 'ec8f2cb8-f904-4473-902f-67ade18bd225'
          }
        ],
        'legacyItemId': 'b8bb5e8b8c63428aa5fd73525c2eddad'
      }
    ]

  },
  getAuthUrl() {
    return ENDPOINTS.authenticate(VARS.client_id)
  },
  async isAuthDataValid() {
    let userSettings = await this.getUserSettings()
    let autData = {}
    if (userSettings !== null && userSettings !== undefined) {
      autData = userSettings.auth
      if (autData !== null) {
        return true
      }
    }
    return false
  },
  async authenticate(authorizationCode) {
    return await window.node_api.get_ue_access_token(authorizationCode)
  },
  async loadVault() {
    //await this.getProjectVersion()
    // console.log(await db.vaultLibrary.toArray())
   return await db.vaultLibrary.toArray()
  },
  async testDatat(){
    let data = [{
      "assetId": "15bc890e1f044d0fae93d38ae84fdfe2",
      "assetNamespace": "ue",
      "categories": [
        {
          "id": "assets/megascans",
          "name": null
        }
      ],
      "description": "A high quality pack of clovers, grass and weeds created from real world scan data.",
      "distributionMethod": "ASSET_PACK",
      "images": [
        {
          "md5": "84274c7f669b1f8d312b800f1020f985",
          "type": "Featured",
          "url": "https://cdn1.epicgames.com/ue/product/Featured/MegascansMeadowPack_featured-894x488-84274c7f669b1f8d312b800f1020f985.png",
          "width": "894",
          "height": "488",
          "uploadedDate": "2017-10-12T12:37:37.213Z"
        }
      ],
      "projectVersions": [
        {
          "artifactId": "Megascan15bc890e1f044d0fae93d38ae84fdfe2V2",
          "engineVersions": [
            "UE_4.18"
          ],
          "targetPlatforms": [
            "Windows",
            "Mac"
          ],
          "buildVersions": [
            {
              "buildVersion": "4.18.0-3743933+++depot+UE4-UserContent-Windows",
              "platform": "Windows"
            },
            {
              "buildVersion": "4.18.0-3743933+++depot+UE4-UserContent-Mac",
              "platform": "Mac"
            }
          ]
        },
        {
          "artifactId": "Megascan15bc890e1f044d0fae93d38ae84fdfe2V1",
          "engineVersions": [
            "UE_4.15",
            "UE_4.16",
            "UE_4.17"
          ],
          "targetPlatforms": [
            "Windows",
            "Mac"
          ],
          "buildVersions": [
            {
              "buildVersion": "4.18.0-3695413+++depot+UE4-UserContent-Windows",
              "platform": "Windows"
            },
            {
              "buildVersion": "4.18.0-3695413+++depot+UE4-UserContent-Mac",
              "platform": "Mac"
            }
          ]
        },
        {
          "artifactId": "Megascan15bc890e1f04V3",
          "engineVersions": [
            "UE_4.19"
          ],
          "targetPlatforms": [
            "Windows",
            "Mac"
          ],
          "buildVersions": [
            {
              "buildVersion": "4.18.0-4057892+++depot+UE4-UserContent-Mac",
              "platform": "Mac"
            },
            {
              "buildVersion": "4.18.0-4057892+++depot+UE4-UserContent-Windows",
              "platform": "Windows"
            }
          ]
        },
        {
          "artifactId": "Megascan15bc890e1f04V6",
          "engineVersions": [
            "UE_4.22",
            "UE_4.23",
            "UE_4.24",
            "UE_4.25",
            "UE_4.26",
            "UE_4.27",
            "UE_5.0",
            "UE_5.1",
            "UE_5.2",
            "UE_5.3"
          ],
          "targetPlatforms": [
            "Windows",
            "Mac"
          ],
          "buildVersions": [
            {
              "buildVersion": "4.21.0-7092014+++depot+UE4-UserContent-Windows",
              "platform": "Windows"
            },
            {
              "buildVersion": "4.21.0-7092014+++depot+UE4-UserContent-Mac",
              "platform": "Mac"
            }
          ]
        },
        {
          "artifactId": "Megascan15bc890e1f04V4",
          "engineVersions": [
            "UE_4.20"
          ],
          "targetPlatforms": [
            "Windows",
            "Mac"
          ],
          "buildVersions": [
            {
              "buildVersion": "4.21.0-4405929+++depot+UE4-UserContent-Windows",
              "platform": "Windows"
            },
            {
              "buildVersion": "4.21.0-4405929+++depot+UE4-UserContent-Mac",
              "platform": "Mac"
            }
          ]
        },
        {
          "artifactId": "Megascan15bc890e1f04V5",
          "engineVersions": [
            "UE_4.21"
          ],
          "targetPlatforms": [
            "Mac",
            "Windows"
          ],
          "buildVersions": [
            {
              "buildVersion": "4.21.0-7092032+++depot+UE4-UserContent-Windows",
              "platform": "Windows"
            },
            {
              "buildVersion": "4.21.0-7092032+++depot+UE4-UserContent-Mac",
              "platform": "Mac"
            }
          ]
        }
      ],
      "source": "uem",
      "title": "Megascans - Meadow Pack",
      "url": "https://www.unrealengine.com/marketplace/en/product/megascans-meadow-pack",
      "customAttributes": null,
      "legacyItemId": null
    }]

    for (let catalog_item of data) {
      // const catalog_row = await db.vaultLibrary.where('key').equals(catalog_item.assetId).first()
      let catalog_row=await db.vaultLibrary.get(catalog_item.assetId);
      if (catalog_row === undefined) {
        console.log('add')
        await db.vaultLibrary.add({asset:catalog_item},catalog_item.assetId)
      } else {
        console.log('update')
        await db.vaultLibrary.update(catalog_item.assetId, {asset: catalog_item})
      }
      console.log('update comments')
      //await db.vaultLibrary.update(catalog_item.assetId, {comment: "test"})
    }
  },
  async getProjectVersion() {

    // console.log()
    // let arrybuildVersion = []
    //
    // for (let projectVersion of catalog_item.projectVersions) {
    //   let artifactId=projectVersion.artifactId
    //   let buildVersion=projectVersion.buildVersions[0].buildVersion
    //   let engineVersions=projectVersion.engineVersions
    //   let obj = {artifactId,buildVersion,engineVersions};
    //   arrybuildVersion.push(obj)
    // }
    // }
    // console.log(arrybuildVersion)
    // console.log(arrybuildVersion)
    // let orderedVersions = lodash.orderBy(arrybuildVersion, ['buildVersion'], ['asc']);
    //  console.log(orderedVersions)
  },
  async importVault() {
    let userSettings = await this.getUserSettings()
    let options = {}
    options.authData = userSettings.auth
    options.url = ENDPOINTS.vault(userSettings.auth.account_id)
    let data = await window.node_api.get_ue_vault(options)
    console.log(data)
    if (Array.isArray(data)) {
      for (let catalog_item of data) {
        // let buildVersion
        // let thumbnail_url = catalog_item.images[0]?.url
        // let ue_versions = catalog_item.projectVersions[0].engineVersions
        // let orderedVersions = lodash.orderBy(catalog_item.projectVersions.buildVersions, ['buildVersion'], ['desc']);
        // let version = orderedVersions[0]
        // if (version) {
        //   buildVersion = version.buildVersion
        // }

        // let vaultItem = {
        //   description: catalog_item.description,
        //   title: catalog_item.title,
        //   thumbnail_url: thumbnail_url,
        //   buildVersion: buildVersion,
        //   ue_version: ue_versions,
        //   url: catalog_item.url,
        //   artifactId: catalog_item.artifactId,
        // }

        const catalog_row = await db.vaultLibrary.where('assetId').equals(catalog_item.assetId).first()
        if (catalog_row === undefined) {
          await db.vaultLibrary.add(catalog_item)
        } else {
          await db.vaultLibrary.update(catalog_item.assetId, vaultItem)
        }
      }
    }
  }
}
//
// let data = {}
// data.url = ENDPOINTS.auth_code
// data.authorizationCode = authorizationCode
// data.useragent = VARS.client_ua
// data.authorization=`Basic ${VARS.client_cred_base64}`

// data.axiosRequest = {
//   url:ENDPOINTS.auth_code,
//   method: 'post',
//   body: new URLSearchParams({
//     grant_type: 'authorization_code',
//     code: authorizationCode,
//     token_type: 'eg1'
//   }),
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded",
//     "Authorization": `Basic ${VARS.client_cred_base64}`,
//     "User-Agent": VARS.client_ua
//   }
// }


//  console.log(await response.json());
// let axiosRequest = {
//       //   url: 'https://www.fab.com/e/accounts/27966d5331e047a0a4e4b8ed06f3d0ef/ue/library?count=100',
//       //   method: 'GET',
//       //   headers: {
//       //     'Host': 'www.fab.com',
//       //     'User-Agent': 'UELauncher/17.0.2-37848679+++Portal+Release-Live Windows/10.0.22631.1.768.64bit',
//       //     'Authorization': 'Bearer eg1~eyJraWQiOiJnX19WS2pTU21xSjB4WmoxUllrTEdLUTdkbkhpTTlNTGhGVndLUHlTREI0IiwiYWxnIjoiUFMyNTYifQ.eyJhcHAiOiJsYXVuY2hlciIsInN1YiI6IjI3OTY2ZDUzMzFlMDQ3YTBhNGU0YjhlZDA2ZjNkMGVmIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNGEwMmNmOGY0NDE0ZTI5YjE1OTIxODc2ZGEzNmY5YSIsImRuIjoiZGFuMDcwNzA3MDciLCJhbSI6ImF1dGhvcml6YXRpb25fY29kZSIsInAiOiJlTnFsV050dTR6WVEvWi9BQzhTNWJnbjRJUWcyYllGRnQ5aTA2R05Ba1NPWk1FV3lKSlhFL2ZyT1VKZkl0aHpUOWxNY2lkY3o1NXlaa2ZOV05pSXkxeFJhQ2ViYWY4UGlhdWJoVmNGYi84S0RzejZ5eUgwRmNUR2ZDVnZYalZHQ1IyVk5ZUEFld1J1dUdSZkNOaVl5R25XMVBVcVpicFFITGxtQUdKV3BhQy9IZlRUZzZYM2wwMkRXT00zWDdPcitsN3M3ZVh0OVBZZkxtM3QreVcvZ3B2Z0s4dkt1dkphWFVDN3VaczVEQUNPQXZSd2VmVE1MVFJHRVZ5N3QwZDN0MERRbU5GZjFsd0lNbElvdXIzbGp4Qkk4ay9iTmFJdDMwZW9WOEI2bFYyQmtPSHlRK2Uwc1dLRVFpZ0RjaStYaEdWZXpKdUpCYkNORHRKNVh3SnFBSnpoNDlndmFDMHhVVVVPTmZ3bHR1blpZSXZaYllXY1lLS2lzWCtPZzk5bzVabmdOd1hFRUYweHB2YUE3YWxWNDd0Zlo0RkVjbzZvQlE0VjBjRHdnV3pEbzh4bkdYSlVjZHkyVXdRVVRKaFBSR1QvN0loTVNBLzRiZUlSMWlGRGphd2tVam84ak9oN3pFTWJyYzIwckZwYmNnMlMyTE1FVFBhSFJQSG91VmlQSWtIVU9PUTBac2Y0RThMTFJwZEs2QzB5aHJWaDlWeUZtTEhvemMzZzRhM2d2dVR6VzlmcnN6dEgvMit2M29ZbkxzTGdmaUN5c01TQmE5V1lBT0wwNmlYUXZBc0Z3RjVZMm5zRXN4clZPWmlNQnd3WjFTNTh1aVBRRVdYRzdIZHlMRXpZVVZ1c1dEYWFJYXZQNURGVVJEZjdEVUNpQlYzVEJuREQwc2VzOWNBaEUxdVM5WUNKL3VGYi9KUWZGKzUxa2R1TkpPMmxBcXhVSmVVb1FVZ1VLQ0s4OEpLUEo0WXZiekQ2Qkcxbllkd1NuVmlHMCs0K3NLeHNrTnBwRStyVWVtWUY3Q1l5UjlZTzg2V2tHeTFvRVBwVnhEVkx4Q2VmcDgwUGpkWlorZGhOTHR3TUZrQmhMWG9kN0JXSEgyMFRybEFpbnBnaWkxTEJ4THduaWQ5Z1ZWYjVTR25KSFZpSVpGdGZiVm9VOHRhdkdKUVdHbUwxb3REeVFtUXlHNXl6TzYxRWdyblF1MWt1OVc3aWlMRGFaOTVEckgwd2JlWEgvbm02UGdUK0xQd1RCbnczbWVCNW9yVVFWRE11cm9xeGFwWUJTNVBCUmN2NkxqSlNlcU9EaGpYdVpEVjQ3L0V1UDNRR3k3Zlh5S2Qva3pvVytBbko4UFFidzRMRUtSQndEMG1jS0txRjRJM3VJdTlYU002b1l1ak5rWnp3VVp1UVMyY0MrUC96OXgrTnYzMzYrUEQvL2VQbng5SlJJdjNtTm52TFdWOXgwSnNxNHJKWEpONTd4M0xCOW00T3p1MjErOWFpZXM4UW45L0M5OXlzc3dsSjlmanFnbnkzZlY0OEJrclNRcndQVk1vcWxyaTZPd092QTBFSXVVUEZIcVdOdlhvR2RXbTZvRWRwYWJxbElqdXY5NU9kUzR0aVFGanJLdWdRV3UxUXVuQ2NQaHVVdmIzUk1tZVlWdEhWa1MrcVZvd2tPbFVSR3kzUnlvVlUwZW9WTlZHNmIwellmWFEzWjE1TGtnWGJ3clZFVE9GV3RNQ1ZUTGwvL0xyY0xrOUVpK0hOUFpQRUpoRGpVSkRTS0Iwd2tLekJ0VjhkY0taVmtMNVBwSGJ5M0hoUEppQkR0VkJ1UnpNOHR2Y00vS2k2Zk1jVThXM1I1ZUxMK29UT3pyN1BPNTVYQk01alVQVzBKSTBNUCt6cHRnVTAwMXAwZGdIUitqMXVCd1JvVU5qb1lsbDVNR3I3bUJlaGszV1RpZUo2b3hDcjE5MGV4K3cxaG93a2JsY1N3U1ZwNTkyUEFjSkh4eHdDeXpPTXI2cFpuUjVqRU5CZ0VRM0tQTGx0L05JREQ0SWxYSi9jUWRPYXpLb3QvRzR6V3FMUW9HcVdsd2thZHBWODFacUlTUXB1eVIycjVjR21zbi9Ud0ZIOS8xRmJNY3V3RU1VYTR0cW5nTDJMOVl5cUdkczZjM1Zkd0RlRm4rb3hFTWlRMkFPcUZqVC82NUs2RklVUDBsOG85TGtHczB1bGFwYlNmRnl4OVh0aHNYRm9uMm13Qis0Uy9GVUxVYW14dm5INDI0YXhFbWRBL0s4eXQwQmZISjQ4MzdJczMwM3dxWmxvTG8vaGEzNVVxYldnLy9hN1M1ZFVkaTBsaHhXU1V6SFc2OFA0Zlo1VUZZdz09IiwiaWFpIjoiMjc5NjZkNTMzMWUwNDdhMGE0ZTRiOGVkMDZmM2QwZWYiLCJzZWMiOjEsImFjciI6InVybjplcGljOmxvYTphYWwyIiwiY2xzdmMiOiJsYXVuY2hlciIsInQiOiJzIiwiYXV0aF90aW1lIjoxNzMxMjk3NzU5LCJpYyI6dHJ1ZSwiZXhwIjoxNzMxMzI2NTU5LCJpYXQiOjE3MzEyOTc3NTksImp0aSI6ImI3N2E2NTMxYjFhZjQ4NGFiY2YyMmJlNzE5MGRmZjcyIn0.e3XVs9LeWFngtYL58A-anxYlsmTzRLCzbPHNnNfuWodMJdaH90XQdEG2GlZHdN4UDMEXYbUGJsEVWxz-WXoLu2Cqud3jrd1lArZt6ogiy9u0_Jp8n63Z5ZyV2ZgZHDXPm4f89flhieTaj2c5iUPvmnZ6JdqKn9GVt6bEMM1i9KZy43s-GMgfI6mTbRxLx1eagRpB8r3VqAqv5NV1GCOtlXOLGUBt7K-12JG8qTp18SuPK1kD0i9TCKrhUHlkGCW9aA-wE-sXnRrX389rDSMAPzjnatJQi3ZMxpUV6RUG4cjAou4k_ErrgbMDsCnI__5_it_gtK0zVbgrU2bOns-tzmJhu8sfEPO5V__lPhAFo8nlnKFMMMFpCpr93-TJDOpShVvOXnJBjpFER0-oj1EzJXYxiZGA-gVjiNCOPTUGy9VlEiM_PSm-ILI1nC7URKoV3YX4qgo5s4OMSO-mf6Jw5mLjfaP5VqXBKk1nt47_m_R--nq2Bn6p_OByC1oGjbZE7OsEfg9U8fC6jXmxJGoyhCrc2YqYNitwqZJguCxCEzrVqk8uDNJ9PdS0sKDqELZOl8YME6MX4_bns5TkpkI0EUmRkY7StgbldO7-FkmtCh6ZAltnlo9Razx_4Hgr35tkr6x_NGYF1KGyXj1m2wD25OF0j87m1xYOqeze3eKxCjY'
//       //   },
//       //   timeout: 0,
//       //   maxRedirects: 21,
//       //   withCredentials: false
//       // }
//       // let data = {}
//       // data.axiosRequest = axiosRequest

//return window.node_api.api_fetch({})

//       try {
//         authData = user_settings.authData
//       } catch (err) {
//         console.error(`Error accessing reading authorization data`)
//       }
//
//       if (authData.access_token && new Date() < new Date(authData.expires_at)) {
//         return authData
//       } else if (authData.access_token && new Date() < new Date(authData.refresh_expires_at)) {
//         console.log('Auth expired.')
//         return await login()
//       } else {
//         console.log('Auth invalid.')
//         return await login()
//       }
//     }
//
//     function getAuthorizationCode() {
//       const url = `
//     Login to your Epic Account here:
//     ${ENDPOINTS.login(VARS.client_id)}
//     And please enter your authorization code: `
//       return url
//     }
//
//     async function login() {
//       // let user_settings = await db.user_settings.where("id").equals(1).first();
//       // if (user_settings !== null && user_settings !== undefined) {
//       //   this.unreal_token = user_settings.unreal_token
//       //   this.account_number = user_settings.account_number
//       //   this.vault_cache_path = user_settings.vault_cache_path
//       //
//       //   let catalog_url = 'https://catalog-public-service-prod06.ol.epicgames.com/catalog/api/shared/namespace/ue/bulk/items?includeDLCDetails=false&includeMainGameDetails=false&country=US&locale=en'
//       //   let entitlement_url = 'https://entitlement-public-service-prod08.ol.epicgames.com/entitlement/api/account/' + this.account_number + '/entitlements'
//       //   let assets_url = 'https://launcher-public-service-prod06.ol.epicgames.com/launcher/api/public/assets/Windows?label=Live'
//       //
//       //   fetch_options.method = 'GET'
//       //   fetch_options.headers = {
//       //     'Authorization': this.unreal_token,
//       //     'Content-Type': 'application/json'
//       //   }
//       //   fetch_options.url = assets_url
//       //   let assets = await window.myNodeApi.api_fetch(fetch_options)
//       //   let count_params, start = 0, count = 1000
//       //
//       //   //loop 20 times or until entitlements count = 0 this should load 20,000 assets if someone has that many
//       //   for (let i = 0; i <= 20; i++) {
//       //     fetch_options.method = 'GET'
//       //     fetch_options.headers = {
//       //       'Authorization': this.unreal_token,
//       //       'Content-Type': 'application/json'
//       //     }
//       //     count_params = '?start=' + start + '&count=' + count
//       //     fetch_options.url = entitlement_url + count_params
//       //     let entitlements = await window.myNodeApi.api_fetch(fetch_options)
//
//
//       // let axiosRequest = {
//       //   url: 'https://www.fab.com/e/accounts/27966d5331e047a0a4e4b8ed06f3d0ef/ue/library?count=100',
//       //   method: 'GET',
//       //   headers: {
//       //     'Host': 'www.fab.com',
//       //     'User-Agent': 'UELauncher/17.0.2-37848679+++Portal+Release-Live Windows/10.0.22631.1.768.64bit',
//       //     'Authorization': 'Bearer eg1~eyJraWQiOiJnX19WS2pTU21xSjB4WmoxUllrTEdLUTdkbkhpTTlNTGhGVndLUHlTREI0IiwiYWxnIjoiUFMyNTYifQ.eyJhcHAiOiJsYXVuY2hlciIsInN1YiI6IjI3OTY2ZDUzMzFlMDQ3YTBhNGU0YjhlZDA2ZjNkMGVmIiwibXZlciI6ZmFsc2UsImNsaWQiOiIzNGEwMmNmOGY0NDE0ZTI5YjE1OTIxODc2ZGEzNmY5YSIsImRuIjoiZGFuMDcwNzA3MDciLCJhbSI6ImF1dGhvcml6YXRpb25fY29kZSIsInAiOiJlTnFsV050dTR6WVEvWi9BQzhTNWJnbjRJUWcyYllGRnQ5aTA2R05Ba1NPWk1FV3lKSlhFL2ZyT1VKZkl0aHpUOWxNY2lkY3o1NXlaa2ZOV05pSXkxeFJhQ2ViYWY4UGlhdWJoVmNGYi84S0RzejZ5eUgwRmNUR2ZDVnZYalZHQ1IyVk5ZUEFld1J1dUdSZkNOaVl5R25XMVBVcVpicFFITGxtQUdKV3BhQy9IZlRUZzZYM2wwMkRXT00zWDdPcitsN3M3ZVh0OVBZZkxtM3QreVcvZ3B2Z0s4dkt1dkphWFVDN3VaczVEQUNPQXZSd2VmVE1MVFJHRVZ5N3QwZDN0MERRbU5GZjFsd0lNbElvdXIzbGp4Qkk4ay9iTmFJdDMwZW9WOEI2bFYyQmtPSHlRK2Uwc1dLRVFpZ0RjaStYaEdWZXpKdUpCYkNORHRKNVh3SnFBSnpoNDlndmFDMHhVVVVPTmZ3bHR1blpZSXZaYllXY1lLS2lzWCtPZzk5bzVabmdOd1hFRUYweHB2YUE3YWxWNDd0Zlo0RkVjbzZvQlE0VjBjRHdnV3pEbzh4bkdYSlVjZHkyVXdRVVRKaFBSR1QvN0loTVNBLzRiZUlSMWlGRGphd2tVam84ak9oN3pFTWJyYzIwckZwYmNnMlMyTE1FVFBhSFJQSG91VmlQSWtIVU9PUTBac2Y0RThMTFJwZEs2QzB5aHJWaDlWeUZtTEhvemMzZzRhM2d2dVR6VzlmcnN6dEgvMit2M29ZbkxzTGdmaUN5c01TQmE5V1lBT0wwNmlYUXZBc0Z3RjVZMm5zRXN4clZPWmlNQnd3WjFTNTh1aVBRRVdYRzdIZHlMRXpZVVZ1c1dEYWFJYXZQNURGVVJEZjdEVUNpQlYzVEJuREQwc2VzOWNBaEUxdVM5WUNKL3VGYi9KUWZGKzUxa2R1TkpPMmxBcXhVSmVVb1FVZ1VLQ0s4OEpLUEo0WXZiekQ2Qkcxbllkd1NuVmlHMCs0K3NLeHNrTnBwRStyVWVtWUY3Q1l5UjlZTzg2V2tHeTFvRVBwVnhEVkx4Q2VmcDgwUGpkWlorZGhOTHR3TUZrQmhMWG9kN0JXSEgyMFRybEFpbnBnaWkxTEJ4THduaWQ5Z1ZWYjVTR25KSFZpSVpGdGZiVm9VOHRhdkdKUVdHbUwxb3REeVFtUXlHNXl6TzYxRWdyblF1MWt1OVc3aWlMRGFaOTVEckgwd2JlWEgvbm02UGdUK0xQd1RCbnczbWVCNW9yVVFWRE11cm9xeGFwWUJTNVBCUmN2NkxqSlNlcU9EaGpYdVpEVjQ3L0V1UDNRR3k3Zlh5S2Qva3pvVytBbko4UFFidzRMRUtSQndEMG1jS0txRjRJM3VJdTlYU002b1l1ak5rWnp3VVp1UVMyY0MrUC96OXgrTnYzMzYrUEQvL2VQbng5SlJJdjNtTm52TFdWOXgwSnNxNHJKWEpONTd4M0xCOW00T3p1MjErOWFpZXM4UW45L0M5OXlzc3dsSjlmanFnbnkzZlY0OEJrclNRcndQVk1vcWxyaTZPd092QTBFSXVVUEZIcVdOdlhvR2RXbTZvRWRwYWJxbElqdXY5NU9kUzR0aVFGanJLdWdRV3UxUXVuQ2NQaHVVdmIzUk1tZVlWdEhWa1MrcVZvd2tPbFVSR3kzUnlvVlUwZW9WTlZHNmIwellmWFEzWjE1TGtnWGJ3clZFVE9GV3RNQ1ZUTGwvL0xyY0xrOUVpK0hOUFpQRUpoRGpVSkRTS0Iwd2tLekJ0VjhkY0taVmtMNVBwSGJ5M0hoUEppQkR0VkJ1UnpNOHR2Y00vS2k2Zk1jVThXM1I1ZUxMK29UT3pyN1BPNTVYQk01alVQVzBKSTBNUCt6cHRnVTAwMXAwZGdIUitqMXVCd1JvVU5qb1lsbDVNR3I3bUJlaGszV1RpZUo2b3hDcjE5MGV4K3cxaG93a2JsY1N3U1ZwNTkyUEFjSkh4eHdDeXpPTXI2cFpuUjVqRU5CZ0VRM0tQTGx0L05JREQ0SWxYSi9jUWRPYXpLb3QvRzR6V3FMUW9HcVdsd2thZHBWODFacUlTUXB1eVIycjVjR21zbi9Ud0ZIOS8xRmJNY3V3RU1VYTR0cW5nTDJMOVl5cUdkczZjM1Zkd0RlRm4rb3hFTWlRMkFPcUZqVC82NUs2RklVUDBsOG85TGtHczB1bGFwYlNmRnl4OVh0aHNYRm9uMm13Qis0Uy9GVUxVYW14dm5INDI0YXhFbWRBL0s4eXQwQmZISjQ4MzdJczMwM3dxWmxvTG8vaGEzNVVxYldnLy9hN1M1ZFVkaTBsaHhXU1V6SFc2OFA0Zlo1VUZZdz09IiwiaWFpIjoiMjc5NjZkNTMzMWUwNDdhMGE0ZTRiOGVkMDZmM2QwZWYiLCJzZWMiOjEsImFjciI6InVybjplcGljOmxvYTphYWwyIiwiY2xzdmMiOiJsYXVuY2hlciIsInQiOiJzIiwiYXV0aF90aW1lIjoxNzMxMjk3NzU5LCJpYyI6dHJ1ZSwiZXhwIjoxNzMxMzI2NTU5LCJpYXQiOjE3MzEyOTc3NTksImp0aSI6ImI3N2E2NTMxYjFhZjQ4NGFiY2YyMmJlNzE5MGRmZjcyIn0.e3XVs9LeWFngtYL58A-anxYlsmTzRLCzbPHNnNfuWodMJdaH90XQdEG2GlZHdN4UDMEXYbUGJsEVWxz-WXoLu2Cqud3jrd1lArZt6ogiy9u0_Jp8n63Z5ZyV2ZgZHDXPm4f89flhieTaj2c5iUPvmnZ6JdqKn9GVt6bEMM1i9KZy43s-GMgfI6mTbRxLx1eagRpB8r3VqAqv5NV1GCOtlXOLGUBt7K-12JG8qTp18SuPK1kD0i9TCKrhUHlkGCW9aA-wE-sXnRrX389rDSMAPzjnatJQi3ZMxpUV6RUG4cjAou4k_ErrgbMDsCnI__5_it_gtK0zVbgrU2bOns-tzmJhu8sfEPO5V__lPhAFo8nlnKFMMMFpCpr93-TJDOpShVvOXnJBjpFER0-oj1EzJXYxiZGA-gVjiNCOPTUGy9VlEiM_PSm-ILI1nC7URKoV3YX4qgo5s4OMSO-mf6Jw5mLjfaP5VqXBKk1nt47_m_R--nq2Bn6p_OByC1oGjbZE7OsEfg9U8fC6jXmxJGoyhCrc2YqYNitwqZJguCxCEzrVqk8uDNJ9PdS0sKDqELZOl8YME6MX4_bns5TkpkI0EUmRkY7StgbldO7-FkmtCh6ZAltnlo9Razx_4Hgr35tkr6x_NGYF1KGyXj1m2wD25OF0j87m1xYOqeze3eKxCjY'
//       //   },
//       //   timeout: 0,
//       //   maxRedirects: 21,
//       //   withCredentials: false
//       // }
//       // let data = {}
//       // data.axiosRequest = axiosRequest
//       //
//       // let entitlements = await window.myNodeApi.api_fetch(data)
//     }



